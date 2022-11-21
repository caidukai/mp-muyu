// app.js
App({
  onLaunch() {
  },
  getSetting: function () {
    return getApp().globalData.settings || {
      muyu: "/static/images/muyu.png",
      gu: "/static/images/gu.png",
      knockContent: ["功德 +1"],
      audio: {
        url: "/static/images/muyu-2.mp3"
      },
      auto: {
        speed: 100,
        knock: 666,
        type: 2,
        timestamp: 0
      }
    };
  },
  globalData: {
    scene: "",
    isLogin: false,
    user: null,
    ratio: true,
    sysSubscribe: {
      switch: false,
      v: null
    },
    pop: {
      active: false,
      point: 0
    },
    exitConfirm: {
      active: false,
      path: ""
    },
    settings: null
  }
})