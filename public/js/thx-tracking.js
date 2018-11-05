let uuid = function () {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
};

let getCookie = function (name) {
  let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return value ? value[2] : null;
};

let setCookie = function (tracking_id, name, value, exp) {
  let date = new Date();
  date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);

  let cookie = getCookie(name);
  if (!cookie) {
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
  }
  else {
    value = cookie;
  }

  let trace = getCookie('tracking_id');
  if (!trace) {
    document.cookie = 'tracking_id=' + tracking_id + ';expires=' + date.toUTCString() + ';path=/';
  }

  return value;
};

let setTracking = function (tracking_id) {
  return setCookie(tracking_id, 'thx_id', uuid(), 730)
};
