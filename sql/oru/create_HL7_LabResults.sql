CREATE TABLE HL7_LabResults (
    id               INT IDENTITY(1,1) PRIMARY KEY,
    filler_order     VARCHAR(50)  NOT NULL,      -- OBR.3: lab's order number
    placer_order     VARCHAR(50),                -- OBR.2: clinic's order number
    mrn              VARCHAR(50),                -- PID.3 (MR)
    patient_name     VARCHAR(200),               -- PID.5
    panel_code       VARCHAR(20),                -- OBR.4.1
    panel_name       VARCHAR(200),               -- OBR.4.2
    set_id           INT,                        -- OBX.1
    loinc_code       VARCHAR(20)  NOT NULL,      -- OBX.3.1
    test_name        VARCHAR(200),               -- OBX.3.2
    result_value     VARCHAR(50),                -- OBX.5
    units            VARCHAR(30),                -- OBX.6
    ref_range        VARCHAR(50),                -- OBX.7
    abnormal_flag    VARCHAR(5),                 -- OBX.8 (N, H, L, HH, LL)
    result_status    VARCHAR(5),                 -- OBX.11 (P, F, C, X)
    comment          VARCHAR(2000),              -- NTE lines after this OBX, joined
    observed_at      DATETIME2,                  -- OBX.14
    reported_at      DATETIME2,                  -- OBR.22
    last_message_id  VARCHAR(50),                -- MSH.10 of the last message that touched this row
    received_at      DATETIME2 DEFAULT SYSDATETIME(),
    updated_at       DATETIME2,
    CONSTRAINT UQ_LabResult UNIQUE (filler_order, loinc_code)   -- one row per test per order
);
