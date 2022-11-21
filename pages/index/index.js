// index.js
// 获取应用实例
const app = getApp()
let interstitialAd = null
let rewardedVideoAd = null
Page({
  data: {
    popHint: {
      active: false,
      model: 0,
      type: 0
    },
    knocked: true,
    bgSound: {
      active: true
    },
    vibrate: {
      active: true
    },
    scripture: {
      playing: true,
      id: 0,
      count: 0,
      lyric: [],
      speed: 100,
      current: -1,
      max: 0,
      timer: null,
      animation: null,
      dataOfAni: null
    },
    muyuAnimation: null,
    muyuAnimationData: null,
    stickAnimation: null,
    stickAnimationData: null,
    settings: {},
    knockContent: {
      timer: 0,
      data: []
    },
    autoKnocked: {
      enable: false,
      timer: null,
      speed: 800,
      times: 666,
      unlimited: true
    },
    videoConfirm: {
      active: false
    }
  },
  initAnimation: function () {
    var e = wx.createAnimation({
        duration: 100,
        timingFunction: "ease"
      }),
      n = wx.createAnimation({
        transformOrigin: "100% 50%",
        duration: 100,
        timingFunction: "ease"
      }),
      x = wx.createAnimation({
        duration: 300,
        timingFunction: "linear"
      })
    this.setData({
      muyuAnimation: e,
      stickAnimation: n,
      'scripture.animation': x
    })
  },
  // 事件处理函数
  toggleBgSound: function () {
    this.setData({
      'bgSound.active': !this.data.bgSound.active
    })
  },
  toggleVibrate: function () {
    this.setData({
      'vibrate.active': !this.data.vibrate.active
    })
  },
  knock: function () {
    this.data.autoKnocked.enable || this.knockDown();
  },
  knockDown: function () {
    let that = this
    if (that.data.bgSound.active) {
      that.audioFn();
    }
    that.setData({
      muyuAnimationData: {},
      stickAnimationData: {},
      'scripture.dataOfAni': {}
    })
    that.setData({
      muyuAnimation: that.data.muyuAnimation.scale(.94).step({
        duration: 50
      }),
      stickAnimation: that.data.stickAnimation.rotate(-30).step({
        duration: 50
      })
    })
    that.setData({
      muyuAnimation: that.data.muyuAnimation.scale(1).step({
        duration: 50
      }),
      stickAnimation: that.data.stickAnimation.rotate(0).step({
        duration: 50
      })
    })
    that.setData({
      muyuAnimationData: that.data.muyuAnimation.export(),
      stickAnimationData: that.data.stickAnimation.export(),
      'scripture.count': that.data.scripture.count + 1
    })
    that.data.vibrate.active && wx.vibrateShort()
    if (that.data.settings.knockContent.length > 0) {
      let knockContentData = that.data.knockContent.data
      knockContentData.push(that.data.settings.knockContent[(Math.random() * (that.data.settings.knockContent.length - 1)).toFixed(0)])
      that.setData({
        'knockContent.data': knockContentData
      })
    }
    if (that.data.knockContent.data.length >= 30) {
      setTimeout(function () {
        that.setData({
          'knockContent.data': []
        })
      }, 800)
    }
    wx.nextTick(() => {
      that.setData({
        muyuAnimationData: {},
        stickAnimationData: {}
      })
    });
  },
  saveKnock: function (count) {
    wx.request({
      url: 'url',
      data: {
        count
      }
    })
  },
  reset: function () {
    this.saveKnock(this.data.scripture.count)
    this.setData({
      "scripture.count": 0,
      "scripture.current": -1,
      "knockContent.data": [],
      "scripture.animation": this.data.scripture.animation.translateY(0).step(),
      "autoKnocked.enable": false
    })
    this.setData({
      "scripture.dataOfAni": this.data.scripture.animation.export()
    })
    this.autoKnocked&&this.autoKnocked.timer&&clearInterval(this.autoKnocked.timer)
    this.scripture&&this.scripture.timer&&clearInterval(this.scripture.timer)
  },
  audioFn: function () {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = false // 是否自动开始播放，默认为 false
    innerAudioContext.loop = false // 是否循环播放，默认为 false
    wx.setInnerAudioOption({ // ios在静音状态下能够正常播放音效
      obeyMuteSwitch: false, // 是否遵循系统静音开关，默认为 true。当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音。
      success: function (e) {},
      fail: function (e) {}
    })
    innerAudioContext.src = this.data.settings.audio.url
    innerAudioContext.play()
  },
  videoConfirmShow: function () {
    this.setData({
      'videoConfirm.active': true
    })
  },
  stayPage: function () {
    this.setData({
      'videoConfirm.active': false
    })
  },
  preAutoKnock: function () {
    if (this.data.settings.adIsOpen && this.data.settings.videoAdId) {
      if (!wx.getStorageSync('lastAdTime') || wx.getStorageSync('lastAdTime') && new Date().getTime() - (wx.getStorageSync('lastAdTime') > 43200000)) {
        this.videoConfirmShow()
      } else {
        this.autoKnockHandle()
      }
    } else {
      this.autoKnockHandle()
    }
  },
  autoKnock: function () {
    this.setData({
      'videoConfirm.active': false
    })
    if (wx.createRewardedVideoAd) {
      rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: this.data.settings.videoAdId
      })
      rewardedVideoAd.onLoad(() => {
        console.log('onLoad event emit')
      })
      rewardedVideoAd.show()
        .catch(() => {
          rewardedVideoAd.load()
            .then(() => rewardedVideoAd.show())
            .catch(err => {
              this.autoKnockHandle()
            })
        })
      rewardedVideoAd.onClose((res) => {
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          wx.setStorageSync('lastAdTime', new Date().getTime())
          this.autoKnockHandle()
        } else {
          wx.showToast({
            title: '未观看结束，无法自动',
          })
          // 播放中途退出，不下发游戏奖励
        }
      })
      rewardedVideoAd.onError((err) => {
        console.log(err)
      })
    }

  },
  autoKnocked: function () {
    this.setData({
      'autoKnocked.enable': false,
      'autoKnocked.current': 0
    })
    clearInterval(this.data.autoKnocked.timer)
  },
  autoKnockHandle: function () {
    let that = this
    that.setData({
      'autoKnocked.enable': true
    })
    let e = function () {
      if (that.data.autoKnocked.unlimited) {
        that.knockDown()
      } else {
        if (that.data.scripture.count >= that.data.autoKnocked.times) {
          that.setData({
            'autoKnocked.enable': false,
            'autoKnocked.current': 0
          })
          return clearInterval(that.data.autoKnocked.timer)
        } else {
          that.knockDown()
        }
      }
    }
    that.data.autoKnocked.timer = setInterval(e, that.data.autoKnocked.speed)
  },
  onLoad() {
    let that = this
    let a = {
      "muyu": "/static/images/muyu.png",
      "gu": "/static/images/gu.png",
      "knockContent": [
        "功德 +1"
      ],
      "audio": {
        "url": "/static/images/muyu-2.mp3"
      },
      "godImg": "/static/images/god.png",
      "autoKnocked": {
        "enable": false,
        "timer": null,
        "speed": 800,
        "times": 666,
        "unlimited": true
      },
      "adIsOpen": true,
      "chaPingAdId": "adunit-7460a7510882280a",
      "videoAdId": "adunit-fe4c25747c87555f"
    }
    that.setData({
            settings: a,
            autoKnocked: a.autoKnocked
          })
    wx.nextTick(res => {
      if (that.data.settings.adIsOpen && that.data.settings.chaPingAdId) {
        if (wx.createInterstitialAd) {
          interstitialAd = wx.createInterstitialAd({
            adUnitId: that.data.settings.chaPingAdId
          })
          interstitialAd.onLoad(() => {
            console.log('onLoad event emit')
          })
          interstitialAd.onError((err) => {
            console.log('onError event emit', err)
          })
          interstitialAd.onClose((res) => {
            console.log('onClose event emit', res)
          })
        }
      }
    })
  },
  onShow() {
    this.initAnimation()
    this.reset()
  },
  onShareAppMessage() {
    return {
      title: "解压电子木鱼，净化心灵！快来试一试吧！",
      path: "/pages/index/index",
      imageUrl: "/static/images/share.jpg",
    }
  },
  onShareTimeline: function () {
    return {
      title: "解压电子木鱼，净化心灵！快来试一试吧！",
      path: "/pages/index/index",
      imageUrl: "/static/img/share.jpg",
    }
  },
  onHide(e) {
    this.reset()
  },
  // getUserProfile(e) {
  //   // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
  //   wx.getUserProfile({
  //     desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
  //     success: (res) => {
  //       console.log(res)
  //       this.setData({
  //         userInfo: res.userInfo,
  //         hasUserInfo: true
  //       })
  //     }
  //   })
  // },
  // getUserInfo(e) {
  //   // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
  //   console.log(e)
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // }
})