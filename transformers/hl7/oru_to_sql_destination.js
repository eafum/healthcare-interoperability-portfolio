// ===== Database Writer (Use JavaScript = Yes): one UPDATE-or-INSERT per result =====
// Keep the createDatabaseConnection(...) line that Mirth generated for you; replace the rest with this.

var dbConn;
try {
    dbConn = DatabaseConnectionFactory.createDatabaseConnection('DRIVER', 'URL', 'USER', 'PASSWORD');   // <-- keep Mirth's line

    var results = JSON.parse($('results'));

    for (var i = 0; i < results.length; i++) {
        var r = results[i];

        // UPDATE first: same order + same test = same result (this is how a correction replaces the original)
        var upd = new java.util.ArrayList();
        upd.add(r.result_value);  upd.add(r.units);   upd.add(r.ref_range);
        upd.add(r.abnormal_flag); upd.add(r.result_status); upd.add(r.comment);
        upd.add(r.observed_at);   upd.add($('reported_at')); upd.add($('message_id'));
        upd.add($('filler_order')); upd.add(r.loinc_code);

        var rows = dbConn.executeUpdate(
            "UPDATE HL7_LabResults SET result_value = ?, units = ?, ref_range = ?, abnormal_flag = ?, " +
            "result_status = ?, comment = NULLIF(?, ''), observed_at = CAST(NULLIF(?, '') AS DATETIME2), " +
            "reported_at = CAST(NULLIF(?, '') AS DATETIME2), last_message_id = ?, updated_at = SYSDATETIME() " +
            "WHERE filler_order = ? AND loinc_code = ?", upd);

        // Nothing updated = first time we see this result -> INSERT
        if (rows == 0) {
            var ins = new java.util.ArrayList();
            ins.add($('filler_order')); ins.add($('placer_order')); ins.add($('mrn')); ins.add($('patient_name'));
            ins.add($('panel_code'));   ins.add($('panel_name'));
            ins.add(r.set_id); ins.add(r.loinc_code); ins.add(r.test_name); ins.add(r.result_value);
            ins.add(r.units);  ins.add(r.ref_range);  ins.add(r.abnormal_flag); ins.add(r.result_status);
            ins.add(r.comment); ins.add(r.observed_at); ins.add($('reported_at')); ins.add($('message_id'));

            dbConn.executeUpdate(
                "INSERT INTO HL7_LabResults (filler_order, placer_order, mrn, patient_name, panel_code, panel_name, " +
                "set_id, loinc_code, test_name, result_value, units, ref_range, abnormal_flag, result_status, " +
                "comment, observed_at, reported_at, last_message_id) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULLIF(?, ''), " +
                "CAST(NULLIF(?, '') AS DATETIME2), CAST(NULLIF(?, '') AS DATETIME2), ?)", ins);
        }
    }
} finally {
    if (dbConn) { dbConn.close(); }
}
