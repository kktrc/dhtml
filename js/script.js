$(function () {

    myLayout = new dhtmlXLayoutObject({
        parent: "layoutObj",
        pattern: "2U",
        offsets: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        cells: [
            {
                id: "a",
                text: "Texta",
                header: false,
            },
            {
                id: "b",
                text: "更多",
                header: true,
                width: 300,
            }
        ]
    });
    scheduler.xy.scale_height = 35;
    scheduler.xy.nav_height = 66;
    scheduler.config.multi_day = true;
    scheduler.locale.labels.timeline_tab = "房间视图";
    scheduler.locale.labels.unit_tab = "技师视图";
    scheduler.locale.labels.section_custom = "技师";
    scheduler.config.mark_now = true;
    scheduler.config.first_hour = 8;
    scheduler.config.last_hour = 22;
    scheduler.config.xml_date = "%Y-%m-%d %H:%i";
    scheduler.config.details_on_create = true;
    scheduler.config.details_on_dblclick = true;
    scheduler.config.full_day = false;
    scheduler.xy.menu_width = 0;//去除toolbar
    scheduler.config.icons_select = ["icon_details", "icon_delete"];
    scheduler.templates.tooltip_date_format = scheduler.date.date_to_str("%m月%d日 %H:%i");
    //


    //控制左侧时间轴
    scheduler.templates.hour_scale = function (date) {
        var hour = date.getHours();
        var top = '00';
        var bottom = '30';
        if (hour < 10)
            hour = '0' + hour;
        //if(hour==12)
        //top = 'PM';
        //hour =  ((date.getHours()+11)%12)+1;
        var html = '';
        var section_width = Math.floor(scheduler.xy.scale_width / 2);
        var minute_height = Math.floor(scheduler.config.hour_size_px / 2);
        html += "<div class='dhx_scale_hour_main' style='width: " + section_width + "px; height:" + (minute_height * 2) + "px;'>" + hour + "</div><div class='dhx_scale_hour_minute_cont' style='width: " + section_width + "px;'>";
        html += "<div class='dhx_scale_hour_minute_top' style='height:" + minute_height + "px; line-height:" + minute_height + "px;'>" + top + "</div><div class='dhx_scale_hour_minute_bottom' style='height:" + minute_height + "px; line-height:" + minute_height + "px;'>" + bottom + "</div>";
        html += "<div class='dhx_scale_hour_sep'></div></div>";
        return html;
    };
    //控制事件颜色
    scheduler.templates.event_class = function (start, end, event) {
        var css = "";
        if (end < (new Date())) {//预约结束时间小于当前时间
            css += "event_past";
        } else {
            if (event.room_id) // 根据房间设置事件颜色
                css += "event_" + event.room_id;

            if (event.id == scheduler.getState().select_id) {
                css += " selected";
            }
        }
        return css; // default return
    };
    //控制事件文字
    scheduler.templates.event_text = function (start, end, event) {
        if (event.member == undefined) {
            return event.text;
        } else {
            var roomId = event.room_id || roomOptions[0].key;
            var newBedOptions = "";
            var roomLabel = "";
            var bedLabel = "";
            for (var i in roomOptions) {
                if (roomOptions[i].key == roomId) {
                    newBedOptions = roomOptions[i].children;
                    roomLabel = roomOptions[i].label;
                    break;
                }
            }
            for (var i in newBedOptions) {
                if (newBedOptions[i].key == event.bed_id) {
                    bedLabel = newBedOptions[i].label;
                    break;
                }
            }
            var memberStr = event.member == "" ? "" : ("<b> " + event.member + "</b>");
            event.text = memberStr;

            var results = [];
            event.member == "" ? results.push("") : results.push("<b>"+event.member+"</b>" );
            event.telephone == "" ? results.push("") : results.push("<b>"+event.telephone+"</b>" );
            roomLabel == "" ? results.push("") : results.push( roomLabel);
            bedLabel == "" ? results.push("") : results.push(bedLabel);
            event.description == "" ? results.push("") : results.push(event.description);
            return results.join(" <br/> ");
        }
    };
    //保存事件验证
    scheduler.attachEvent("onEventSave", function (id, ev) {
        //保存验证前先更新ev.text的值
        var memberStr = ev.member == "" ? "" : ("<b> " + ev.member + "</b>");
        var telephoneStr = ev.telephone == "" ? "" : ("<b> " + ev.telephone + "</b>");
        ev.text = memberStr;

        if (!ev.member) {
            alert("必填");
            return false;
        }
        if (ev.member < 2) {
            alert("太短");
            return false;
        }
        return true;
    })


    var durations = {
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        minute: 60 * 1000
    };

    var get_formatted_duration = function (start, end) {
        var diff = end - start;

        var days = Math.floor(diff / durations.day);
        diff -= days * durations.day;
        var hours = Math.floor(diff / durations.hour);
        diff -= hours * durations.hour;
        var minutes = Math.floor(diff / durations.minute);

        var results = [];
        if (days) results.push(days + " 天");
        if (hours) results.push(hours + " 小时");
        if (minutes) results.push(minutes + " 分钟");
        return results.join(", ");
    };

    //事件tooltip
    scheduler.templates.tooltip_text = function (start, end, event) {
        if (event.member == undefined) {
            return event.text;
        } else {
            var roomId = event.room_id || roomOptions[0].key;
            var newBedOptions = "";
            var roomLabel = "";
            var bedLabel = "";
            var technicianLabel = "";

            for (var i in technicianOptions) {
                if (technicianOptions[i].key == event.technician_id) {
                    technicianLabel = technicianOptions[i].label;
                    break;
                }
            }
            for (var i in roomOptions) {
                if (roomOptions[i].key == roomId) {
                    newBedOptions = roomOptions[i].children;
                    roomLabel = roomOptions[i].label;
                    break;
                }
            }

            for (var i in newBedOptions) {
                if (newBedOptions[i].key == event.bed_id) {
                    bedLabel = newBedOptions[i].label;
                    break;
                }
            }
            var results = [];
            event.member == "" ? results.push("<b>会员:</b>未填写") : results.push("<b>会员:</b>" + event.member);
            event.telephone == "" ? results.push("<b>电话:</b>未填写") : results.push("<b>电话:</b>" + event.telephone);
            technicianLabel == "" ? results.push("<b>技师:</b>未填写") : results.push("<b>技师:</b>" + technicianLabel);
            roomLabel == "" ? results.push("<b>房间:</b>未填写") : results.push("<b>房间:</b>" + roomLabel);
            bedLabel == "" ? results.push("<b>床位:</b>未填写") : results.push("<b>床位:</b>" + bedLabel);
            results.push("<b>开始时间:</b>" + scheduler.templates.tooltip_date_format(start));
            results.push("<b>结束时间:</b>" + scheduler.templates.tooltip_date_format(end));
            results.push("<b>历时:</b>" + get_formatted_duration(start, end));
            event.description == "" ? results.push("<b>备注:</b>无") : results.push("<b>备注:</b>" + event.description);
            return results.join(" <br/> ");
        }


    };


    function checkReadonly(id) {
        if (!id) {
            return true;
        }
        var ev = this.getEvent(id);
        if (ev.start_date <= (new Date())) {//预约结束时间小于当前时间
            dhtmlx.message({
				text:"预约已经开始,若要修改请双击",
				expire:6000
			});
            ev.readonly = true;
        } else {
            ev.readonly = false;
        }
        return !this.getEvent(id).readonly;
    }

    scheduler.attachEvent("onBeforeDrag", checkReadonly);
    //scheduler.attachEvent("onClick", checkReadonly);
    //技师下拉选项server端取数据
    //var technicianOptions = scheduler.serverList("technicianOptions");
    //房间下拉选项server端取数据
    //var roomOptions = scheduler.serverList("roomOptions");

    var technicianOptions = [
        {key: 1, label: "小白", no: "01"},

       {key: 2, label: "小红", no: "02"},
        {key: 3, label: "张兰", no: "03"},
        {key: 4, label: "李录", no: "09"},
        {key: 5, label: "王的", no: "05"},
        {key: 6, label: "小订单", no: "06"},
        {key: 7, label: "小呃呃呃", no: "04"},
        {key: 8, label: "小嘎嘎嘎", no: "07"},
        {key: 9, label: "小qq群", no: "08"},
       {key: 10, label: "老变变变", no: "10"}
    ];
    //房间下拉选项
    /**
     var roomOptions = [
     { key: 'r1', label: "房间A"},
     { key: 'r2', label: "房间B"},
     { key: 'r3', label: "VIP"}
     ];
     **/

    var roomOptions = [ // original hierarhical array to display
        {"key": 'r1', "label": "房间a", "open": true, "children": [
            {"key": "20", "label": "A床位1"},
            {"key": "30", "label": "A床位2"},
            {"key": "40", "label": "A床位3"}

        ]},
        {"key": 'r2', "label": "房间b", "open": true, "children": [
            {"key": "80", "label": "B床位1"},
            {"key": "90", "label": "B床位2"}
        ]},
        {"key": 'r3', "label": "VIP", "open": true, "children": [
            {"key": "100", "label": "VIP床位1"}
        ]}
    ];



    //更新下拉选项
    var update_select_options = function (select, options) { // helper function
        select.options.length = 0;
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            select[i] = new Option(option.label, option.key);
        }
    };
    //房间onchange方法
    var room_onchange = function (event) {
        var new_bed_options = "";
            for (var i in roomOptions) {
                if (roomOptions[i].key == this.value) {
                    new_bed_options = roomOptions[i].children;
                    break;
                }
            }

        update_select_options(scheduler.formSection('bed').control, new_bed_options);
    };

    scheduler.attachEvent("onBeforeLightbox", function (id) {
        var ev = scheduler.getEvent(id);
        if (!ev.child_id) {
            var room_id = ev.room_id || roomOptions[0].key;
            var new_bed_options = "";
            for (var i in roomOptions) {
                if (roomOptions[i].key == room_id) {
                    new_bed_options = roomOptions[i].children;
                    break;
                }
            }
            update_select_options(scheduler.formSection('bed').control, new_bed_options);
        }
        return true;
    });
    //创建timeline视图
    scheduler.createTimelineView({
        name: "timeline",
        x_unit: "minute",
        x_date: "%H:%i",
        x_step: 30,
        x_size: 28,
        x_start: 16,
        x_length: 48,
        y_unit: roomOptions,
        y_property: "bed_id",
        section_autoheight: false,
        render: "tree",
        folder_dy: 20,
        dy: 90,
        event_dy: "full"
    });

    //创建units视图
    scheduler.createUnitsView({
        name: "unit",
        property: "technician_id",
        list: technicianOptions,
        size: 7,
        step: 7
    });
    //!!!unit_scale_text 要放在createUnitsView方法后
    scheduler.templates.unit_scale_text = function (key, label, unit) {
        if (unit.css) {
            return "<span class='" + unit.css + "'>" + label + "</span>";
        } else {
            return label+ "<br/>工号:" + unit.no;
        }
    };
    //lightbox/born_book/getOptions
    scheduler.config.lightbox.sections = [
        { name: "member", height: 27, map_to: "member", type: "input", focus: true, default_value: ""},
        { name: "telephone", height: 27, map_to: "telephone", type: "input", focus: false, default_value: ""},
        { name: "time", height: 72, type: "bootstraptime", map_to: "auto"},
        { name: "technician", height: 27, type: "select", options: technicianOptions, map_to: "technician_id" },
        { name: "room", height: 27, type: "select", options: roomOptions, map_to: "room_id", onchange: room_onchange },
        { name: "bed", height: 27, type: "select", options: roomOptions, map_to: "bed_id" },
        { name: "description", height: 70, map_to: "description", type: "textarea", focus: false, default_value: ""}
    ];

    myLayout.cells("a").attachScheduler(new Date(), "unit");
  //  scheduler.load("events.xml")
  //   scheduler.load(["/born_book/getTechniciansAndDatas","/born_book/getRooms"],"json");
   // var dp = new dataProcessor("/born_book/handleData","json");
//		dp.init(scheduler);
    myLayout.cells("b").appendObject("rdiv");

    var calendar = scheduler.renderCalendar({
        container: "cal_here",
        navigation: true,
        handler: function (date) {
            scheduler.setCurrentView(date, scheduler._mode);
        }
    });
    scheduler.linkCalendar(calendar);
    scheduler.setCurrentView(scheduler._date, scheduler._mode);


function setvalues(name, telephone) {
    scheduler.formSection('member').setValue(name);
    scheduler.formSection('telephone').setValue(telephone);
};

$("#setvalues1").bind("click",function(){
    scheduler.formSection('member').setValue("宋先生");
    scheduler.formSection('telephone').setValue("15026596459");

    });

});