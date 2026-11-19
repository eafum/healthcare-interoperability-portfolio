# Troubleshooting Log

Issues found while building and testing these interfaces, with root cause and fix.

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | Postgres insert failed with a type mismatch | Text values inserted into typed columns | Explicit `CAST` in destination SQL |
| 2 | Duplicate key error when a patient was resent | Plain `INSERT` | `ON CONFLICT DO UPDATE` (Postgres) / `MERGE` (SQL Server) |
| 3 | Database Reader kept picking up the same rows | No processed flag | Polling flag column plus post-process `UPDATE` |
| 4 | Updates erased fields the new message didn't send | `UPDATE` overwrote with blanks | `COALESCE(NULLIF(new,''), existing)` |
| 5 | SQL Server error converting date | Empty string sent to `DATETIME2` | `DateUtil.convertDate` plus `NULLIF(x,'')` |
| 6 | OpenEMR container could not reach its database ("Name does not resolve") | Database container failed to start (wrong startup command for the image) | Pinned `mariadb:10.11` with `mariadbd` |
| 7 | DG1 diagnoses split across lines in OpenEMR orders | Escaped carriage returns (`\X0d\`) plus line breaks inside fields | Preprocessor regex to rejoin segments |
| 8 | An ORM arrived on the results channel | No message-type filtering | MSH.9 filter on every source |
| 9 | Filtered ADT messages were NAK'd (AR) by default | Default response settings | Filtered messages ACK with AA and an explanatory text |
| 10 | A result file was missing after an outage test | SFTP container was stopped | Queue-on-failure held the message; delivered on restart |
| 11 | "Address already in use" on deploy | Two channels on the same port | Unique port per channel |
| 12 | Wrong values in SQL (MRN, provider) | Channel-map key typos and fields read by position | Consistent key names; select repeating fields by type |
| 13 | VXU messages ACK'd but never stored | Filter field pointed to a non-existent segment | `msg['MSH']['MSH.9']['MSH.9.1']` |
| 14 | FHIR server received literal `${fhir_bundle}` | Channel-map key not set or misspelled | Matched the transformer key to the destination placeholder |
| 15 | `URISyntaxException` from the HTTP Sender | Raw `|` in the query string | URL-encode as `%7C` |
| 16 | `ReferenceError: patient is not defined` | `Patient` vs `patient` (case-sensitive) | Consistent variable names |
| 17 | Filter crashed with "unterminated string literal" | Curly quote (`”`) pasted into the rule value | Retyped straight quotes |
| 18 | Bundle contained only 1 of 3 entries | All entries written inside one object; duplicate keys overwrote each other | One object per entry, separated by `},{` |
| 19 | HAPI template error on DiagnosticReport | Server narrative template bug with list-valued `interpretation` | Sent our own `text` narrative |
| 20 | HAPI rejected conditional references (`Patient?identifier=…`) | Server setting disables inline match URLs | Included Patient and ServiceRequest as Bundle entries linked by `urn:uuid` |
| 21 | SQL Server error "Incorrect syntax near 'try'" | Database Writer in SQL mode received JavaScript | Switched the destination to **Use JavaScript = Yes** |
| 22 | `last_message_id` empty after load | Channel-map key typo (`massage_id`) and a field read from the wrong segment | Key renamed to `message_id`, path `MSH.10.1` |
| 23 | `ALTER TABLE … ADD COLUMN` failed | MySQL/PostgreSQL syntax used on SQL Server | `ALTER TABLE … ADD column_name type` |
| 24 | A40 filter would crash | Misplaced quote in `['MSH'.9.2]` | `['MSH.9.2']`; checked in the Generated Script tab |
| 25 | SmartHL7 "Network Error" | Channel not deployed / not listening on the port | Deployed the channel and confirmed the port on the Dashboard |
| 26 | RDE^O11 orders returned `MSA|AR` ("Message Rejected") | Second filter rule read `MSH.11` / `MSH.9.1` instead of the trigger event | Rule set to `MSH.9.2` = `O11`; redeployed; ACK `AA` |
