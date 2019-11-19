var clusterize, chks = [],
    coins = {},
    last_coins = [],
    last_updated = 0,
    last_curr = "",
    last_data = [],
    ls = localStorage,
    ux_delay = 300,
    default_coins = {
        Bitcoin: "BTC",
        Ethereum: "ETH",
        Ripple: "XRP",
        NEO: "NEO",
        Litecoin: "LTC",
        Cardano: "ADA",
        Monero: "XMR",
        Tether: "USDT",
        Dash:"DASH"
    },
    currency = "USD",
    interval_price = 6e4,
    interval_motd = 86400,
    body = document.body,
    class_app_loading = "loading",
    class_notification_page = "show-notification",
    class_tracking_page = "show-tracking",
    class_checkbox_loading = "checkboxes-loading",
    class_show_checked = "show-checked",
    class_settings_page = "show-settings",
    class_explorer_page = "show-explorer",
    class_calculator_page = "show-calculator",
    class_graph_page = "show-graph",
    class_show_alert = "show-alert",
    ti_prefix = "ci_",
    app_loader = document.getElementById("loader"),
    page_tracking = document.getElementById("tracking"),
    filter_bar = document.getElementById("filter-bar"),
    filter_clear = document.getElementById("clear-filter"),
    currency_select = document.getElementById("currency"),
    alert_el = document.getElementById("alert"),
    button_add_coins = document.getElementById("button-add-coins"),
    button_notification = document.getElementById("button-notification"),
    button_explorer = document.getElementById("button-explorer"),
    button_calculator = document.getElementById("button-calculator"),
    button_graph = document.getElementById("button-graph"),
    button_back = document.getElementById("button-back"),
    button_uncheck_all = document.getElementById("uncheck-all"),
    button_settings = document.getElementById("button-settings"),
    button_reset = document.getElementById("reset"),
    button_close_motd = document.getElementById("close-alert"),
    green = "#4cd964",
    red = "#ff3b30";


function cl(e) {}

function add_class(e, t) {
    e.classList.add(t)
}

function remove_class(e, t) {
    e.classList.remove(t)
}

function has_class(e, t) {
    return !!e.classList.contains(t)
}

function get_key_by_value(e, t) {
    return Object.keys(e).find(function (c) {
        return e[c].values[1] === t
    })
}

function sort_object(e) {
    return Object.keys(e).sort().reduce(function (t, c) {
        return t[c] = e[c], t
    }, {})
}

function get_select_index(e, t) {
    for (var c = 0; c < e.length; c++)
        if (e[c].childNodes[0].nodeValue === t) return c
}

function arrays_are_equal(e, t) {
    if (e.length !== t.length) return !1;
    for (var c = 0, a = e.length; c < a; c++)
        if (e[c] !== t[c]) return !1;
    return !0
}

function format_time(e) {
    var t = new Date(e),
        c = t.toString().split(" ", 4).join(" "),
        a = t.toString().split(" ")[4],
        s = t.toString().split(" ")[6],
        n = a.slice(0, -6),
        r = "AM";
    return n >= 13 && (n -= 12, r = "PM"), "12" == n && (n = "12", r = "PM"), "00" == n && (n = "12"), c + " " + (n = ("0" + n).slice(-2)) + a.slice(-6) + " " + r + " " + s
}

function round(e) {
    var t = parseFloat(e);
    return t >= 1 ? number_with_commas(t.toFixed(2)) : e
}

function number_with_commas(e) {
    var t = e.toString().split(".");
    return t[0] = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","), t.join(".")
}

function init_clusterize() {
    clusterize = new Clusterize({
        scrollId: "checkboxes",
        contentId: "contentArea",
        rows_in_block: 20,
        show_no_data_row: !1,
        callbacks: {
            onUpdate: clusterize_on_update
        }
    })
}

function clusterize_on_update() {
    clusterize.getRowsAmount() > 1 && remove_class(page_tracking, class_checkbox_loading)
}

function build_checkboxes() {
    for (var e = 0; e < coin_list.length; e++) {
        var t = coin_list[e].name,
            c = coin_list[e].symbol.toString();
        chks.push({
            active: !0,
            checked: !1,
            markup: "<div class='ck-parent'><input type='checkbox' class='ck' id='" + c + "' value='" + c + "' data-name='" + t + "'><label for='" + c + "'>" + t + " (" + c + ")</label></div>",
            values: [t, c]
        }), coins.hasOwnProperty(t) && (chks[e].checked = !0, chks[e].markup = chks[e].markup.replace("><label", " checked><label"))
    }
    setTimeout(function () {
        clusterize.update(filtered_checkboxes(chks))
    }, ux_delay)
}

function filtered_checkboxes(e) {
    for (var t = [], c = 0; c < chks.length; c++) e[c].active && t.push(chks[c].markup);
    return t
}

function search_checkboxes() {
    var e = filter_bar.value.toUpperCase();
    if (e.startsWith(":") && /(^|\W):check($|\W)|(^|\W):checke($|\W)|(^|\W):checked($|\W)/gi.exec(e)) {
        Object.keys(coins).length > 0 && add_class(page_tracking, class_show_checked);
        for (var t = 0; t < chks.length; t++) {
            var c = !1;
            !0 === chks[t].checked && (c = !0), chks[t].active = c
        }
        clusterize.update(filtered_checkboxes(chks))
    } else {
        remove_class(page_tracking, "show-checked");
        for (t = 0; t < chks.length; t++) {
            c = !1;
            for (var a = 0; a < chks[t].values.length; a++) chks[t].values[a].toString().toUpperCase().indexOf(e) + 1 && (c = !0);
            chks[t].active = c
        }
        clusterize.update(filtered_checkboxes(chks))
    }
}

function show_filter_clear() {
    filter_bar.value.length > 0 ? filter_clear.style.display = "block" : filter_clear.removeAttribute("style")
}

function clear_filter_bar(e) {
    filter_bar.value = "", show_filter_clear(), search_checkboxes(), has_class(body, class_tracking_page) && filter_bar.focus()
}

function save_setting(e) {
    var t = e.target.dataset.name,
        c = e.target.id,
        a = get_key_by_value(chks, c);
    e.target.checked ? (coins[t] = c, chks[a].checked = !0, chks[a].markup = chks[a].markup.replace("><label", " checked><label"), ls.order || (coins = sort_object(coins)), ls.setItem("coins", JSON.stringify(coins)), ls.removeItem("coins_manually_cleared")) : (delete coins[t], chks[a].checked = !1, chks[a].markup = chks[a].markup.replace(" checked><label", "><label"), ls.setItem("coins", JSON.stringify(coins)), Object.keys(coins).length < 1 && (ls.removeItem("coins"), ls.removeItem("order"), ls.setItem("coins_manually_cleared", !0)))
}

function uncheck_all() {
    for (var e in coins) {
        var t = coins[e],
            c = get_key_by_value(chks, t);
        chks[c].checked = !1, chks[c].markup = chks[c].markup.replace(" checked><label", "><label"), document.getElementById(t).checked = !1
    }
    coins = {}, ls.removeItem("coins"), ls.setItem("coins_manually_cleared", !0), clear_filter_bar()
}

function build_elements(e) {
    add_class(body, class_app_loading);
    for (var t in coins) {
        var c = document.getElementById("placeholder").cloneNode(!0),
            a = c.querySelector(".ti-name"),
            s = c.querySelector(".ti-symbol");
        c.querySelector(".ti-price"), c.querySelector(".ti-change");
        c.removeAttribute("id"), c.classList.add(ti_prefix + coins[t].toLowerCase()), c.classList.add("actual"), a.innerHTML = t, s.innerHTML = coins[t], document.getElementById("ticker").insertBefore(c, document.getElementById("welcome"))
    }
    e()
}

function get_coin_data() {
    check_motd();
    var e = "https://api.coinmarketcap.com/v1/ticker/?convert=" + currency + "&limit=0",
        t = new XMLHttpRequest;
    t.timeout = 2e4, t.open("GET", e), t.onloadstart = function () {
        last_updated = Date.now(), ls.setItem("last_updated", last_updated)
    }, t.onloadend = function () {
        if (200 === t.status) {
            var c = JSON.parse(t.responseText);
            ls.removeItem("last_data"), last_data = [];
            for (var a in c) {
                c[a].name;
                var s = c[a].symbol,
                    n = c[a]["price_" + currency.toLowerCase()],
                    r = c[a].percent_change_24h;
                parseInt(c[a].last_updated);
                if (Object.values(coins).indexOf(s) > -1) {
                    var l = document.querySelector("." + ti_prefix + s.toLowerCase()),
                        o = l.querySelector(".amount"),
                        i = l.querySelector(".ti-change");
                    o.innerHTML = round(n), i.innerHTML = r + "%", last_data.push({
                        symbol: s,
                        price: round(n),
                        change: r
                    }), ls.setItem("last_data", JSON.stringify(last_data))
                }
            }
            setTimeout(function () {
                remove_class(body, class_app_loading)
            }, ux_delay), document.getElementById("logo").title = "Last updated: " + format_time(last_updated)
        } else console.log(t), console.log("Error getting data from " + e), document.getElementById("logo").title = "Error getting data..."
    }, t.send(null)
}

function parse_local_data() {
    check_motd();
    var e = last_data;
    for (var t in e) {
        var c = e[t].symbol,
            a = e[t].price,
            s = e[t].change,
            n = document.querySelector("." + ti_prefix + c.toLowerCase());
        n.querySelector(".amount").innerHTML = a, n.querySelector(".ti-change").innerHTML = s
    }
    setTimeout(function () {
        remove_class(body, class_app_loading)
    }, ux_delay), document.getElementById("logo").title = "Last updated: " + format_time(last_updated)
}

function check_motd() {
    !ls.motd_cleared && ls.motd && (add_class(body, class_show_alert), alert_el.getElementsByTagName("span")[0].innerHTML = ls.motd), (!ls.last_motd_check || Date.now() / 1e3 - parseInt(ls.last_motd_check) / 1e3 > interval_motd) && (ls.setItem("last_motd_check", Date.now()), ls.removeItem("motd_cleared"), get_motd())
}

function get_motd() {
    var e = new XMLHttpRequest;
    e.timeout = 2e4, e.open("GET", "https://raw.githubusercontent.com/quoid/coin-ticker/motd/motd.json"), e.onloadend = function () {
        if (200 === e.status) {
            var t = JSON.parse(e.responseText);
            if ("false" != t.enabled) {
                var c = t.message[Math.floor(Math.random() * t.message.length)];
                ls.setItem("motd", c), alert_el.getElementsByTagName("span")[0].innerHTML = c, add_class(body, class_show_alert)
            }
        } else alert_el.getElementsByTagName("span")[0].innerHTML = "Error, check console", console.log("Error getting data from " + e.responseURL + " - " + e.responseText)
    }, e.send(null)
}

function set_currency() {
    ls.setItem("currency", currency_select.value), currency = currency_select.value, set_currency_symbol()
}

function set_currency_symbol() {
    var e = document.getElementById("placeholder").querySelector(".ti-price").querySelector(".sign"),
        t = currency_select.selectedOptions[0].dataset.symbol;
    currency_select.value;
    e.innerHTML = void 0 != t ? t : "<span>" + currency_select.value + "</span>"
}

function reset() {
    ls.clear(), ls.setItem("currency", "USD"), ls.setItem("coins", JSON.stringify(default_coins)), currency = "USD", currency_select.selectedIndex = get_select_index(currency_select, "USD"), set_currency_symbol(), coins = JSON.parse(ls.coins), document.querySelectorAll(".actual").forEach(function (e) {
        return e.parentNode.removeChild(e)
    }), remove_class(body, class_settings_page), build_elements(get_coin_data)
}

function mousedown(e) {
    e.target.closest(".actual").setAttribute("draggable", !0)
}

function mouseup(e) {
    var t = e.target.closest(".actual");
    t.classList.contains(".dragging") || t.removeAttribute("draggable")
}

function dragstart(e) {
    e.target.classList.contains("actual") ? (e.target.classList.add("dragging"), e.dataTransfer.effectAllowed = "copy", e.dataTransfer.setData("Text", this.id)) : e.preventDefault()
}

function dragend(e) {
    e.target.classList.contains("actual") && (e.target.classList.remove("dragging"), e.target.removeAttribute("draggable"), document.querySelectorAll(".dragover").length > 0 && document.querySelector(".dragover").classList.remove("dragover"))
}

function dragenter(e) {
    var t = e.target,
        c = document.querySelector(".dragging");
    t.classList.contains("actual") || (t = e.target.closest(".actual")), !t.classList.contains("dragging") && c && t != c.nextSibling && (document.querySelectorAll(".dragover").length > 0 && document.querySelector(".dragover").classList.remove("dragover"), t.classList.add("dragover")), c === t && document.querySelectorAll(".dragover").length > 0 && document.querySelector(".dragover").classList.remove("dragover")
}

function dragover(e) {
    e.preventDefault()
}

function drop(e) {
    e.preventDefault();
    var t = document.querySelector(".dragging"),
        c = e.target;
    e.target.classList.contains("actual") || (c = e.target.closest(".actual")), document.getElementById("ticker").insertBefore(t, c), set_coins_order()
}

function set_coins_order() {
    var e = document.querySelectorAll(".actual");
    coins = {}, ls.removeItem("coins");
    for (var t = 0; t < e.length; t++) {
        var c = e[t].querySelector(".ti-name").innerHTML,
            a = e[t].querySelector(".ti-symbol").innerHTML;
        coins[c] = a
    }
    ls.setItem("coins", JSON.stringify(coins)), ls.order || ls.setItem("order", "custom")
}

function show_explorer_page(){
    add_class(body, class_explorer_page)
}

function hide_explorer_page(){
    remove_class(body, class_explorer_page)
}

function show_graph_page(){
    add_class(body, class_graph_page)
}

function hide_graph_page(){
    remove_class(body, class_graph_page)
}

function show_calculator_page(){
    add_class(body, class_calculator_page)
}

function hide_calculator_page(){
    remove_class(body, class_calculator_page)
}

function show_notification_page(){
    add_class(body, class_notification_page)
}

function hide_notification_page(){
    remove_class(body, class_notification_page)
}

function show_tracking_page() {
    last_coins = Object.keys(coins), add_class(body, class_tracking_page), add_class(page_tracking, class_checkbox_loading), build_checkboxes(), filter_bar.focus()
}

function hide_tracking_page() {
    remove_class(body, class_tracking_page), clear_filter_bar(), clusterize.clear(), chks = [], arrays_are_equal(last_coins, Object.keys(coins)) || (document.querySelectorAll(".actual").forEach(function (e) {
        return e.parentNode.removeChild(e)
    }), Object.keys(coins).length > 0 && build_elements(get_coin_data))
}

function show_settings_page() {
    add_class(body, class_settings_page), last_curr = ls.currency
}

function hide_settings_page() {
    remove_class(body, class_settings_page), last_curr != ls.currency && Object.keys(coins).length > 0 && (document.querySelectorAll(".actual").forEach(function (e) {
        return e.parentNode.removeChild(e)
    }), build_elements(get_coin_data))
}

function navigate_back() {
    has_class(body, class_tracking_page) ? hide_tracking_page() : has_class(body, class_settings_page) && hide_settings_page(), has_class(body, class_explorer_page) && hide_explorer_page(),has_class(body, class_graph_page) && hide_graph_page(),has_class(body, class_calculator_page) && hide_calculator_page(),has_class(body,class_notification_page) && hide_notification_page()
}

function start() {
    var e = Date.now() - last_updated;
    add_class(body, class_app_loading), Object.keys(coins).length > 0 ? document.querySelectorAll(".actual").length < 1 ? build_elements(e < interval_price ? parse_local_data : get_coin_data) : e < interval_price ? parse_local_data() : get_coin_data() : remove_class(body, class_app_loading)
}

function load_settings() {
    ls.coins ? coins = JSON.parse(ls.coins) : ls.coins || ls.coins_manually_cleared || (ls.setItem("coins", JSON.stringify(default_coins)), coins = default_coins), ls.currency ? (currency = ls.currency, currency_select.selectedIndex = -1, document.getElementById("c_usd").removeAttribute("selected"), currency_select.selectedIndex = get_select_index(currency_select, ls.currency), document.getElementById("c_" + ls.currency.toLowerCase()).setAttribute("selected", "selected"), set_currency_symbol()) : ls.setItem("currency", "USD"), ls.last_updated && (last_updated = parseInt(ls.last_updated)), ls.last_data && (last_data = JSON.parse(ls.last_data))
}

document.getElementById("ticker").addEventListener("mousedown", function (e) {
    "ti-icon" === e.target.className && mousedown(e)
}), document.getElementById("ticker").addEventListener("mouseup", function (e) {
    "ti-icon" === e.target.className && mouseup(e)
}), document.getElementById("ticker").addEventListener("dragstart", function (e) {
    e.target.classList.contains("actual") && dragstart(e)
}), document.getElementById("ticker").addEventListener("dragend", function (e) {
    e.target.classList.contains("actual") && dragend(e)
}), document.getElementById("ticker").addEventListener("dragenter", function (e) {
    e.target.classList.contains("actual") && dragenter(e)
}), document.getElementById("ticker").addEventListener("dragover", function (e) {
    e.target.classList.contains("actual") && dragover(e)
}), document.getElementById("ticker").addEventListener("drop", function (e) {
    e.target.classList.contains("actual") && drop(e)
}), button_add_coins.addEventListener("click", show_tracking_page), button_back.addEventListener("click", navigate_back), filter_bar.addEventListener("input", function () {
    search_checkboxes(), show_filter_clear()
}), button_explorer.addEventListener("click",show_explorer_page), button_notification.addEventListener("click", show_notification_page),button_graph.addEventListener("click",show_graph_page),button_calculator.addEventListener("click",show_calculator_page),
filter_clear.addEventListener("click", clear_filter_bar), filter_clear.addEventListener("keydown", clear_filter_bar), page_tracking.addEventListener("click", function (e) {
    "ck" === e.target.className && save_setting(e)
}), button_uncheck_all.addEventListener("click", uncheck_all), button_settings.addEventListener("click", show_settings_page), currency_select.addEventListener("change", set_currency), button_reset.addEventListener("click", reset), button_close_motd.addEventListener("click", function () {
    ls.setItem("motd_cleared", "true"), remove_class(body, class_show_alert)
}), document.addEventListener("click", function (e) {
    "A" === e.target.tagName && open_link(e)
}), window.addEventListener("blur", function () {
    has_class(body, class_tracking_page) && (arrays_are_equal(last_coins, Object.keys(coins)) || document.querySelectorAll(".actual").forEach(function (e) {
        return e.parentNode.removeChild(e)
    }), remove_class(body, class_tracking_page), clear_filter_bar(), clusterize.clear(), chks = []), has_class(body, class_settings_page) && (last_curr != ls.currency && document.querySelectorAll(".actual").forEach(function (e) {
        return e.parentNode.removeChild(e)
    }), remove_class(body, class_settings_page))
}), window.addEventListener("load", function () {
    load_settings(), init_clusterize(), start()
});


