-- Keep the original MRN on moved results (audit / unmerge)
ALTER TABLE HL7_LabResults ADD original_mrn VARCHAR(50);

-- One row per processed A40
CREATE TABLE HL7_PatientMerges (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    message_id    VARCHAR(50) NOT NULL UNIQUE,   -- MSH.10: the same A40 is logged only once
    surviving_mrn VARCHAR(50) NOT NULL,          -- PID.3
    retired_mrn   VARCHAR(50) NOT NULL,          -- MRG.1
    patient_name  VARCHAR(200),                  -- PID.5
    merged_by     VARCHAR(100),                  -- EVN.5
    event_time    DATETIME2,                     -- EVN.2
    rows_moved    INT,
    processed_at  DATETIME2 DEFAULT SYSDATETIME()
);
