_get_event_sday = function(ev) {
    var start = new Date();
    start.setHours(0,0,0,0);
    return Math.floor((ev.start_date.valueOf() - start.valueOf()) / (24 * 60 * 60 * 1000));
}
_pre_render_events_line = function(evs, hold){
    evs.sort(function(a, b) {
        if (a.start_date.valueOf() == b.start_date.valueOf())
            return a.id > b.id ? 1 : -1;
        return a.start_date > b.start_date ? 1 : -1;
    });
    var days = []; //events by weeks
    var evs_originals = [];

    for (var i = 0; i < evs.length; i++) {
        var ev = evs[i];

        //check date overflow
        var sd = ev.start_date;
        var ed = ev.end_date;
        //check scale overflow
        var sh = sd.getHours();
        var eh = ed.getHours();

        ev._sday = _get_event_sday(ev); // sday based on event start_date

        if (!days[ev._sday]) days[ev._sday] = [];

        if (!hold) {
            ev._inner = false;

            var stack = days[ev._sday];

            while (stack.length) {
                var t_ev = stack[stack.length - 1];
                var t_end_date = t_ev.end_date;
                if (t_end_date.valueOf() <= ev.start_date.valueOf()) {
                    stack.splice(stack.length - 1, 1);
                } else {
                    break;
                }
            }
            var slot_index = stack.length;
            var sorderSet = false;
            for (var j = 0; j < stack.length; j++) {
                var t_ev = stack[j];
                var t_end_date = t_ev.end_date;
                if (t_end_date.valueOf() <= ev.start_date.valueOf()) {
                    sorderSet = true;
                    ev._sorder = t_ev._sorder;
                    slot_index = j;
                    ev._inner = true;
                    break;
                }
            }

            if (stack.length)
                stack[stack.length - 1]._inner = true;

            if (!sorderSet) {
                if (stack.length) {
                    if (stack.length <= stack[stack.length - 1]._sorder) {
                        if (!stack[stack.length - 1]._sorder)
                            ev._sorder = 0;
                        else
                            for (j = 0; j < stack.length; j++) {
                                var _is_sorder = false;
                                for (var k = 0; k < stack.length; k++) {
                                    if (stack[k]._sorder == j) {
                                        _is_sorder = true;
                                        break;
                                    }
                                }
                                if (!_is_sorder) {
                                    ev._sorder = j;
                                    break;
                                }
                            }
                        ev._inner = true;
                    } else {
                        var _max_sorder = stack[0]._sorder;
                        for (j = 1; j < stack.length; j++) {
                            if (stack[j]._sorder > _max_sorder)
                                _max_sorder = stack[j]._sorder;
                        }
                        ev._sorder = _max_sorder + 1;
                        ev._inner = false;
                    }

                } else
                    ev._sorder = 0;
            }

            stack.splice(slot_index, slot_index == stack.length ? 0 : 1, ev);

            if (stack.length > (stack.max_count || 0)) {
                stack.max_count = stack.length;
                ev._count = stack.length;
            } else {
                ev._count = (ev._count) ? ev._count : 1;
            }
        }
    }
    if (!hold) {
        for (var i = 0; i < evs.length; i++) {
            evs[i]._count = days[evs[i]._sday].max_count;
        }
        for (var i = 0; i < evs_originals.length; i++)
            evs_originals[i]._count = days[evs_originals[i]._sday].max_count;
    }

    return evs;
};


