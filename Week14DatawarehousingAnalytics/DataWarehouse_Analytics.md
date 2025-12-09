# 📈 Data Warehouse Analytics — Tools & Techniques

## 📋 Learning Objectives

By the end of this presentation you should be able to:
- Use SQL Server MERGE for upsert-style ETL/ELT operations
- Apply SQL Server analytical/window functions for reporting and analytics
- Schedule and run analytic jobs using SQL Server Agent, Windows Task Scheduler, and cron
- Use pandas for data transformations and analytics (including windowing and rolling)
- Apply best practices for scheduling, monitoring, and handling large datasets

---

## 🔁 SQL Server: MERGE (Upsert) Statement

Purpose: perform insert/update/delete in a single atomic statement — useful for incremental loads and SCD-type operations.

Basic structure:

```sql
MERGE INTO target AS T
USING (SELECT CustomerID, Name, Address FROM staging.Customers) AS S
ON (T.CustomerID = S.CustomerID)
WHEN MATCHED AND (
    ISNULL(T.Name,'') <> ISNULL(S.Name,'') OR
    ISNULL(T.Address,'') <> ISNULL(S.Address,'')
) THEN
    UPDATE SET
        T.Name = S.Name,
        T.Address = S.Address,
        T.LastUpdated = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN
    INSERT (CustomerID, Name, Address, CreatedDate)
    VALUES (S.CustomerID, S.Name, S.Address, SYSUTCDATETIME())
WHEN NOT MATCHED BY SOURCE AND T.IsStale = 1 THEN
    DELETE; -- optional cleanup

-- OUTPUT clause can show rows affected
OUTPUT $action, inserted.*, deleted.*;
```

Best practices & gotchas:
- Use MERGE carefully: older SQL Server versions had some edge-case concurrency bugs; test thoroughly and consider locking strategy.
- Prefer deterministic matching keys (business key / natural key) rather than nullable fields.
- Consider using OUTPUT to capture history or audit actions.
- For heavy writes, compare MERGE vs separate UPDATE/INSERT patterns — sometimes split operations can be more predictable.
- Ensure appropriate indexing on join key to avoid table scans.

---

## 📊 SQL Server Analytical / Window Functions (expanded)

Window functions let you perform calculations across a set of rows related to the current row (the window) while preserving the original rows. They are different from aggregate queries (GROUP BY) because they do not collapse rows — instead they add computed columns.

Key concepts:
- PARTITION BY: splits the data into groups (like GROUP BY but keeps rows)
- ORDER BY inside OVER(): defines order within the partition for running totals, ranking, lag/lead
- Framing: `ROWS` vs `RANGE` and window frame boundaries (UNBOUNDED PRECEDING, CURRENT ROW, n PRECEDING)

Common window functions:
- ROW_NUMBER(), RANK(), DENSE_RANK() — numbering & ranking
- NTILE(n) — distribute rows into buckets
- LAG(), LEAD() — access previous/next row values
- FIRST_VALUE(), LAST_VALUE() — pick values from frame
- SUM(), AVG(), COUNT() with OVER() — running totals and rolling aggregates

Why use window functions?
- Running totals, moving averages, sessionization, event sequencing
- Top-N per group (e.g., top students per course) without subqueries
- Compare current row to previous/next row (detect changes)

Below is a small, easy dataset you can paste into a SQL sandbox to visualize behavior and run sample queries.  We'll extend this dataset and add a `#Students` table so you can join names and practice joins + windowing.

Sample data (StudentGrades + Students):

```sql
-- Create sample tables
CREATE TABLE #Students (
    StudentID INT PRIMARY KEY,
    StudentName VARCHAR(100)
);

CREATE TABLE #StudentGrades (
    StudentID INT,
    CourseTakenDate DATE,
    CourseName VARCHAR(50),
    Grade INT
);

-- Insert students
INSERT INTO #Students (StudentID, StudentName) VALUES
(1, 'Ada Lovelace'),
(2, 'Alan Turing'),
(3, 'Grace Hopper'),
(4, 'Katherine Johnson');

-- Insert sample grades (extended)
INSERT INTO #StudentGrades (StudentID, CourseTakenDate, CourseName, Grade) VALUES
(1, '2025-01-10', 'Math', 70),
(1, '2025-02-12', 'Science', 85),
(1, '2025-03-05', 'History', 78),
(1, '2025-04-10', 'Math', 82),
(2, '2025-01-15', 'Math', 88),
(2, '2025-02-20', 'Science', 92),
(2, '2025-03-22', 'History', 75),
(3, '2025-01-08', 'Math', 95),
(3, '2025-02-14', 'Science', 90),
(3, '2025-03-30', 'History', 93),
(4, '2025-02-01', 'Math', 60),
(4, '2025-03-01', 'Science', 65);

SELECT s.StudentID, s.StudentName, g.CourseTakenDate, g.CourseName, g.Grade
FROM #StudentGrades g
JOIN #Students s ON s.StudentID = g.StudentID
ORDER BY s.StudentID, g.CourseTakenDate;
```

The extended table looks like (ordered):

| StudentID | StudentName | CourseTakenDate | CourseName | Grade |
|----------:|:------------|:---------------:|:-----------|------:|
| 1 | Ada Lovelace | 2025-01-10 | Math    | 70
| 1 | Ada Lovelace | 2025-02-12 | Science | 85
| 1 | Ada Lovelace | 2025-03-05 | History | 78
| 1 | Ada Lovelace | 2025-04-10 | Math    | 82
| 2 | Alan Turing  | 2025-01-15 | Math    | 88
| 2 | Alan Turing  | 2025-02-20 | Science | 92
| 2 | Alan Turing  | 2025-03-22 | History | 75
| 3 | Grace Hopper | 2025-01-08 | Math    | 95
| 3 | Grace Hopper | 2025-02-14 | Science | 90
| 3 | Grace Hopper | 2025-03-30 | History | 93
| 4 | Katherine Johnson | 2025-02-01 | Math | 60
| 4 | Katherine Johnson | 2025-03-01 | Science | 65

Example 1 — ROW_NUMBER() with student names

```sql
SELECT
    s.StudentName,
    g.CourseTakenDate,
    g.CourseName,
    g.Grade,
    ROW_NUMBER() OVER (PARTITION BY g.StudentID ORDER BY g.CourseTakenDate) AS RowNum
FROM #StudentGrades g
JOIN #Students s ON s.StudentID = g.StudentID
ORDER BY s.StudentName, RowNum;
```

Example 2 — 3-period moving average (rolling) per student

```sql
SELECT
    s.StudentName,
    g.CourseTakenDate,
    g.Grade,
    AVG(g.Grade) OVER (PARTITION BY g.StudentID ORDER BY g.CourseTakenDate ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS RollingAvg3
FROM #StudentGrades g
JOIN #Students s ON s.StudentID = g.StudentID
ORDER BY s.StudentID, g.CourseTakenDate;
```

Example 3 — Detect improvement streaks (improved over previous course)

```sql
SELECT
    s.StudentName,
    g.CourseTakenDate,
    g.Grade,
    LAG(g.Grade) OVER (PARTITION BY g.StudentID ORDER BY g.CourseTakenDate) AS PrevGrade,
    CASE WHEN g.Grade > LAG(g.Grade) OVER (PARTITION BY g.StudentID ORDER BY g.CourseTakenDate) THEN 1 ELSE 0 END AS Improved
FROM #StudentGrades g
JOIN #Students s ON s.StudentID = g.StudentID
ORDER BY s.StudentID, g.CourseTakenDate;
```

Example 4 — Top student per course (handle ties with DENSE_RANK)

```sql
SELECT CourseName, StudentName, Grade FROM (
    SELECT
        g.CourseName,
        s.StudentName,
        g.Grade,
        DENSE_RANK() OVER (PARTITION BY g.CourseName ORDER BY g.Grade DESC) AS CourseRank
    FROM #StudentGrades g
    JOIN #Students s ON s.StudentID = g.StudentID
) t
WHERE CourseRank = 1
ORDER BY CourseName;
```

Exercises for students (hands-on):

1. Compute a 3-period rolling average for each student and list the rows where the rolling average is below 80.
2. Find students who improved in at least two consecutive recorded courses.
3. Using `NTILE(4)`, bucket students' grades into quartiles per course and show the counts per quartile.
4. Write a query to find the largest jump in grade for each student between consecutive courses (use LAG and a windowed subtraction).
5. Build a query that shows each student's average grade and rank the students overall (use AVG() OVER (PARTITION BY StudentID) and RANK()).

Cleanup (drop temp tables):

```sql
DROP TABLE #StudentGrades;
DROP TABLE #Students;
```

---

## ⏰ Job Scheduling & Orchestration

We cover several common scheduling options: SQL Server Agent (native to SQL Server), Windows Task Scheduler (schtasks / PowerShell), and cron for UNIX-like systems. Also mention using orchestration tools (Airflow, Azure Data Factory) for more complex dependencies.

### SQL Server Agent (recommended for SQL Server jobs)

- Built into SQL Server (Standard/Enterprise editions)
- Supports jobs, steps, schedules, alerts, and operators

Create a simple job with T-SQL:

```sql
USE msdb;
EXEC sp_add_job @job_name = N'Load_Staging_Customers', @enabled = 1;
EXEC sp_add_jobstep
    @job_name = N'Load_Staging_Customers',
    @step_name = N'RunMerge',
    @subsystem = N'TSQL',
    @command = N'EXEC dbo.usp_LoadCustomersFromStaging',
    @on_success_action = 1; -- quit with success

EXEC sp_add_schedule @schedule_name = N'Nightly_2AM',
    @freq_type = 4, -- daily
    @active_start_time = 20000; -- 02:00:00

EXEC sp_attach_schedule @job_name = N'Load_Staging_Customers', @schedule_name = N'Nightly_2AM';
EXEC sp_add_jobserver @job_name = N'Load_Staging_Customers';
```

Monitoring & best practices:
- Use alerts and operators to notify on failures (DBA email/paging).
- Log step output to tables or files for debugging.
- Keep jobs idempotent and safe to re-run.

### Windows Task Scheduler (schtasks) — example to run a PowerShell ETL script

Create a scheduled task that runs a PowerShell script nightly:

```powershell
# Create the scheduled task (run as current user)
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-File C:\etl\run_daily_etl.ps1'
$trigger = New-ScheduledTaskTrigger -Once -At 2am -RepetitionInterval (New-TimeSpan -Days 1)
Register-ScheduledTask -TaskName 'DailyETL' -Action $action -Trigger $trigger -Description 'Run nightly ETL'
```

CLI alternative (schtasks.exe):

```powershell
schtasks /Create /SC DAILY /TN "DailyETL" /TR "powershell -File C:\etl\run_daily_etl.ps1" /ST 02:00
```

PowerShell ETL script example (simple):

```powershell
# run_daily_etl.ps1
$log = "C:\etl\logs\daily_etl_$(Get-Date -Format yyyyMMdd).log"
try {
    Write-Output "Starting ETL at $(Get-Date)" | Out-File $log -Append
    # e.g. run a dotnet tool or sqlcmd
    sqlcmd -S mydbserver -d MyDb -i C:\etl\load_customers.sql | Out-File $log -Append
    Write-Output "ETL finished at $(Get-Date)" | Out-File $log -Append
} catch {
    Write-Output "ETL failed: $_" | Out-File $log -Append
    exit 1
}
```

### cron (Linux) — example running a Python pandas job

Edit crontab (`crontab -e`) and add a line:

```cron
# Run daily ETL at 02:00
0 2 * * * /home/etl/venv/bin/python /home/etl/daily_etl.py >> /home/etl/logs/daily_etl.log 2>&1
```

Shell wrapper (recommended) to activate venv and run safely:

```bash
#!/usr/bin/env bash
set -euo pipefail
LOGDIR=/home/etl/logs
mkdir -p "$LOGDIR"
source /home/etl/venv/bin/activate
python /home/etl/daily_etl.py >> "$LOGDIR/daily_etl_$(date +%F).log" 2>&1
```

### Orchestration platforms (when simple schedulers aren't enough)
- Apache Airflow — dependency DAGs, retries, rich UI
- Azure Data Factory / Synapse Pipelines — cloud-native ETL/ELT orchestration
- Prefect — modern Python-native orchestration

Pick an orchestrator when you need dependency graphs, retries, SLA monitoring, or complex data flows.

---

## 🐼 Pandas for Analytics (Python)

Pandas is a versatile library for data manipulation and analysis. Useful for prototyping analytics, small-to-medium ETL tasks, and data exploration.

### Common patterns
- read_csv / read_parquet
- groupby / agg
- merge / join
- pivot_table
- rolling / expanding / ewm
- shift for lead/lag

Examples

1) Read and basic aggregation

```python
import pandas as pd

df = pd.read_csv('staging/customers.csv')
summary = df.groupby('country').agg(total_customers=('id','nunique'), avg_age=('age','mean')).reset_index()
print(summary.head())
```

2) Merge (join) staging to dimension

```python
stg = pd.read_csv('staging/customers.csv')
dim = pd.read_parquet('warehouse/dim_customers.parquet')

# left join staging onto dimension via business key
merged = stg.merge(dim, how='left', left_on='customer_id', right_on='business_id', indicator=True)
new_rows = merged[merged['_merge']=='left_only']
```

3) Windowing (lead/lag) and rolling

```python
# lead / lag
df = df.sort_values(['student_id','snapshot_date'])
df['prev_status'] = df.groupby('student_id')['status'].shift(1)
df['next_status'] = df.groupby('student_id')['status'].shift(-1)

# rolling avg (3 period) of scores per student
df['rolling_avg'] = df.groupby('student_id')['score'].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)
```

4) Large datasets and performance tips
- Use `dtype` hints on read_csv to reduce memory.
- Use `chunksize` to process in streaming fashion.
- Prefer Parquet on disk for columnar storage and faster IO.
- For >RAM datasets, consider Dask (parallel, out-of-core) or PySpark.
- Use vectorized ops (avoid Python loops).

Example: streaming with chunksize

```python
chunks = pd.read_csv('large_events.csv', chunksize=100_000)
for chunk in chunks:
    process(chunk)  # e.g. aggregate and write interim results
```

5) Writing back to warehouse
- Use fast methods: COPY, bulk inserts, or write parquet and use cloud ingest.
- For SQL Server, use `bcp` or `pyodbc` / `sqlalchemy` + fast executemany.

---

## ✅ Best Practices for Analytics Jobs

- Make jobs idempotent — safe to re-run.
- Add robust logging and structured logs (JSON) for downstream parsing.
- Implement retries with backoff and alerting on repeated failures.
- Keep small steps for easier debugging and observability.
- Store intermediate artifacts (parquet) for reproducibility and debugging.
- Monitor job durations and resource consumption.
- Secure credentials: use environment variables / secret stores, avoid plaintext in scripts.

---

## 🧪 Quick Examples / Cheat Sheet

- MERGE: single statement for upsert; use OUTPUT to capture history.
- Window: `SUM(x) OVER (PARTITION BY y ORDER BY z ROWS BETWEEN ...)` for running totals.
- SQL Agent: use `sp_add_job`, `sp_add_jobstep`, `sp_add_schedule` for programmatic job creation.
- cron: `0 2 * * * /path/to/wrapper.sh` to run daily at 02:00.
- schtasks: `schtasks /Create /SC DAILY /ST 02:00 /TN "DailyETL" /TR "powershell -File C:\etl\run_daily_etl.ps1"`
- pandas: `df.groupby(...).agg(...)`, `groupby().shift()`, `groupby().rolling()`

---

## 📚 Resources

- Microsoft docs: MERGE (Transact-SQL) — https://docs.microsoft.com/sql/t-sql/statements/merge-transact-sql
- Window functions — https://docs.microsoft.com/sql/t-sql/functions/window-functions-transact-sql
- SQL Server Agent jobs — https://docs.microsoft.com/sql/ssms/agent/sql-server-agent
- cron (crontab) manual
- pandas documentation — https://pandas.pydata.org/
- Apache Airflow — https://airflow.apache.org/

---

## 🤔 Discussion Prompts

- When should you prefer MERGE vs separate INSERT/UPDATE logic? (Consider concurrency, bug history on engine, visibility/OUTPUT needs)
- How do you choose between SQL window functions and doing windowing in pandas / Spark? (Consider data size, proximity to source, latency requirements)
- What monitoring & alerting should go around nightly analytics jobs? (SLA, retries, alert channels)

---

*File created for Week 14 — Data Warehouse Analytics presentation.*
