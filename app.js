// app.js
App({
  async onLaunch() {
    let that = this
    // that.setSetting()
    wx.request({
      url: 'https://iondpr.lafyun.com:443/getConfig',
      success: function (res) {
        console.log("配置信息", res)
        getApp().globalData.settings = res.data
        if (that.settingInfoCallback) {
          that.settingInfoCallback(res.data)
        }
      }
    })
  },
  // setSetting: function () {

  // },
  getSetting: function () {
    return getApp().globalData.settings || {
      muyu: "https://muyu.xiaolinwl.com/static/img/muyu.png",
      gu: "https://muyu.xiaolinwl.com/static/img/gu.png",
      knockContent: ["功德 +1", "烦恼 -1"],
      audio: {
        url: "https://muyu.xiaolinwl.com/static/audio/muyu-2.mp3"
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