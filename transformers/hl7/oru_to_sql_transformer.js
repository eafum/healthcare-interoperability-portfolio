// ===== ORU^R01 -> list of results (one per OBX), with NTE comments attached =====

//1. READ the header (same for every result)/////
channelMap.put('message_id',   msg['MSH']['MSH.10']['MSH.10.1'].toString());
channelMap.put('mrn',          msg['PID']['PID.3']['PID.3.1'].toString());
channelMap.put('patient_name', msg['PID']['PID.5']['PID.5.2'].toString() + ' ' + msg['PID']['PID.5']['PID.5.1'].toString());
channelMap.put('placer_order', msg['OBR']['OBR.2']['OBR.2.1'].toString());
channelMap.put('filler_order', msg['OBR']['OBR.3']['OBR.3.1'].toString());
channelMap.put('panel_code',   msg['OBR']['OBR.4']['OBR.4.1'].toString());
channelMap.put('panel_name',   msg['OBR']['OBR.4']['OBR.4.2'].toString());

var reported = msg['OBR']['OBR.22']['OBR.22.1'].toString().substr(0,14);
channelMap.put('reported_at', reported ? DateUtil.convertDate('yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm:ss', reported) : '');

//2. LOOP through ALL segments in order, so each NTE lands on the OBX before it/////
var results = [];        // one item per OBX
var current = null;      // the last OBX we saw (the "parent" for NTEs)

for (var i = 0; i < msg.children().length(); i++) {
    var seg = msg.children()[i];
    var segName = seg.name().toString();

    if (segName == 'OBX') {
        var observed = seg['OBX.14']['OBX.14.1'].toString().substr(0,14);
        current = {
            set_id:        seg['OBX.1']['OBX.1.1'].toString(),
            loinc_code:    seg['OBX.3']['OBX.3.1'].toString(),
            test_name:     seg['OBX.3']['OBX.3.2'].toString(),
            result_value:  seg['OBX.5']['OBX.5.1'].toString(),
            units:         seg['OBX.6']['OBX.6.1'].toString(),
            ref_range:     seg['OBX.7']['OBX.7.1'].toString(),
            abnormal_flag: seg['OBX.8']['OBX.8.1'].toString(),
            result_status: seg['OBX.11']['OBX.11.1'].toString(),
            observed_at:   observed ? String(DateUtil.convertDate('yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm:ss', observed)) : '',
            comment:       ''
        };
        results.push(current);
    }
    else if (segName == 'NTE' && current != null) {
        // NTE after an OBX = a comment on that result; join multiple lines with a space
        var text = seg['NTE.3']['NTE.3.1'].toString();
        current.comment = current.comment ? current.comment + ' ' + text : text;
    }
    else if (segName == 'OBR') {
        current = null;   // NTEs right after OBR belong to the report, not to a result
    }
}

//3. SAVE the list for the destination/////
if (results.length == 0) { throw 'ORU has no OBX results'; }
channelMap.put('result_count', results.length);
channelMap.put('results', JSON.stringify(results));
