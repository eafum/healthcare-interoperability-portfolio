MERGE HL7_Immunizations AS t
USING (SELECT ${filler_order} AS filler_order) AS s
ON t.filler_order = s.filler_order
WHEN MATCHED THEN UPDATE SET
    last_message_id   = ${last_message_id},
    admin_datetime    = COALESCE(CAST(NULLIF(${admin_datetime},'') AS DATETIME2), t.admin_datetime),
    cvx_code          = COALESCE(NULLIF(${cvx_code},''), t.cvx_code),
    vaccine_name      = COALESCE(NULLIF(${vaccine_name},''), t.vaccine_name),
    dose_amount       = COALESCE(CAST(NULLIF(${dose_amount},'') AS DECIMAL(6,2)), t.dose_amount),
    lot_number        = COALESCE(NULLIF(${lot_number},''), t.lot_number),
    lot_expiration    = COALESCE(CAST(NULLIF(${lot_expiration},'') AS DATE), t.lot_expiration),
    mvx_code          = COALESCE(NULLIF(${mvx_code},''), t.mvx_code),
    manufacturer      = COALESCE(NULLIF(${manufacturer},''), t.manufacturer),
    route             = COALESCE(NULLIF(${route},''), t.route),
    site              = COALESCE(NULLIF(${site},''), t.site),
    completion_status = COALESCE(NULLIF(${completion_status},''), t.completion_status),
    action_code       = ${action_code},
    record_status     = CASE WHEN ${action_code} = 'D' THEN 'Deleted' ELSE 'Active' END,
    updated_at        = SYSDATETIME()
WHEN NOT MATCHED THEN INSERT (
    filler_order, last_message_id, sending_facility, mrn, last_name, first_name, dob, sex,
    admin_datetime, cvx_code, vaccine_name, dose_amount, dose_units, record_source,
    administered_npi, administered_by, ordering_npi, lot_number, lot_expiration,
    mvx_code, manufacturer, completion_status, action_code, route, site, vfc_eligibility, record_status
) VALUES (
    ${filler_order}, ${last_message_id}, ${sending_facility}, ${mrn}, ${last_name}, ${first_name},
    CAST(NULLIF(${dob},'') AS DATE), ${sex},
    CAST(NULLIF(${admin_datetime},'') AS DATETIME2), ${cvx_code}, ${vaccine_name},
    CAST(NULLIF(${dose_amount},'') AS DECIMAL(6,2)), ${dose_units}, ${record_source},
    ${administered_npi}, ${administered_by}, ${ordering_npi}, ${lot_number},
    CAST(NULLIF(${lot_expiration},'') AS DATE),
    ${mvx_code}, ${manufacturer}, ${completion_status}, ${action_code}, ${route}, ${site}, ${vfc_eligibility},
    CASE WHEN ${action_code} = 'D' THEN 'Deleted' ELSE 'Active' END
);
