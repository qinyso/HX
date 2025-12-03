// pages/user/identityCode/identityCode.js
const app = getApp()
// 引入本地条形码库
const barcode = require('../../../utils/barcode');
// 引入工具函数
const util = require('../../../utils/util');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    stuName: '',
    stuNo: '',
    college: '',
    major: '',
    identityCode: '',
    isBarcodeEnlarged: false
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  },
  
  /**
   * 放大条形码
   */
  enlargeBarcode() {
    const { stuNo } = this.data
    if (!stuNo) {
      console.log('学号信息暂未获取到，稍后再试')
      return
    }
    
    try {
      // 设置放大状态
      this.setData({ isBarcodeEnlarged: true }, () => {
        // 在DOM更新后再绘制放大的条形码
        setTimeout(() => {
          const ctx = wx.createCanvasContext('enlargedBarcode');
          if (!ctx) {
            console.error('获取放大canvas上下文失败');
            return;
          }
          
          // 放大尺寸
          const width = 800;
          const height = 300;
          
          // 使用本地barcode库生成CODE128格式的条形码
          barcode.code128(ctx, stuNo, width, height);
          console.log('放大条形码生成成功:', stuNo);
        }, 100)
      })
    } catch (error) {
      console.error('放大条形码生成失败:', error);
    }
  },
  
  /**
   * 隐藏放大的条形码
   */
  hideEnlargedBarcode() {
    this.setData({ isBarcodeEnlarged: false })
  },
  
  /**
   * 生成标准可识别的条形码
   */
  generateBarcode() {
    const { stuNo } = this.data
    
    // 确保页面数据已更新
    if (!stuNo) {
      console.log('学号信息暂未获取到，稍后再试')
      return
    }
    
    try {
      // 获取canvas上下文
      const ctx = wx.createCanvasContext('barcodeCanvas');
      if (!ctx) {
        console.error('获取canvas上下文失败');
        return;
      }
      
     
      const width = 680;
      const height = 200;
      
      // 使用barcode库生成CODE128格式的条形码
      barcode.code128(ctx, stuNo, width, height);
      console.log('条形码生成成功:', stuNo);
    } catch (error) {
      console.error('条形码生成失败:', error);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 从缓存获取用户信息
    const stuName = wx.getStorageSync('stuName') || ''
    const stuNo = app.globalData.stuNo || ''
    const college = wx.getStorageSync('college') || ''
    const major = wx.getStorageSync('major') || ''
    const identityCode = wx.getStorageSync('identityCode') || ''
    
    this.setData({
      stuName,
      stuNo,
      college,
      major,
      identityCode
    })
  },

  /**
   * 获取用户详细信息
   */
  getUserDetailInfo() {
    wx.getStorage({
      key: 'openid',
      success: (res) => {
        const url = 'hxapi/api/StuBouding/MyRegInfo'
        util.ReqSend(url, {
          openID: res.data
        }).then(res => {
          console.log('用户详细信息:', res)
          const data = JSON.parse(res.data)
          if (data.status == "1" && data.errorCode == "000" && data.data && data.data.length > 0) {
            const userInfo = data.data[0]
            // 更新页面数据
            this.setData({
              stuNo: userInfo.StuNo || '',
              stuName: userInfo.stuName || '',
              college: userInfo.college || '',
              major: userInfo.major || ''
            })
            // 缓存用户信息
            wx.setStorage({
              key: 'stuNo',
              data: userInfo.StuNo || ''
            })
            wx.setStorage({
              key: 'stuName',
              data: userInfo.stuName || ''
            })
            wx.setStorage({
              key: 'college',
              data: userInfo.college || ''
            })
            wx.setStorage({
              key: 'major',
              data: userInfo.major || ''
            })
            // 更新全局数据
            app.globalData.stuNo = userInfo.StuNo || ''
            // 重新生成条形码
            this.generateBarcode()
          }
        }).catch(error => {
          console.error('获取用户详细信息失败:', error)
        })
      },
      fail: (error) => {
        console.error('获取openid失败:', error)
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 再次获取最新数据
    const stuName = wx.getStorageSync('stuName') || ''
    const stuNo = app.globalData.stuNo || wx.getStorageSync('stuNo') || ''
    const college = wx.getStorageSync('college') || ''
    const major = wx.getStorageSync('major') || ''
    const identityCode = wx.getStorageSync('identityCode') || ''
    
    this.setData({
      stuName,
      stuNo,
      college,
      major,
      identityCode
    })
    
    // 获取详细用户信息（包括学院和专业）
    this.getUserDetailInfo()
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 在页面完全渲染后再生成条形码
    setTimeout(() => {
      console.log('页面渲染完成，开始生成条形码')
      this.generateBarcode()
    }, 100)
  },
  

})