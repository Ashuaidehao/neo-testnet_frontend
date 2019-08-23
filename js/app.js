var responses = {
  en: {
    601: 'You have exceeded the number of requests allowed in one day. Please try again tomorrow.',
    602: 'You have exceeded the number of requests allowed in one day. Please apply again tomorrow.',
    603: 'An internal server error has occurred. Please, try again later.',
    604: 'The verification code is incorrect. Please refresh the page and try again.',
    605: 'Insufficient assets in this account, please contact NGD staff or apply through manual entry.\r\n https://discordapp.com/neo'
  },
  zh: {
    601: '该IP地址今日已经申请，请明天再来。',
    602: '该地址今日已经申请，请明天再来。',
    603: '服务器响应错误，请刷新页面后重试。',
    604: '验证码错误，请刷新页面后重试。',
    605: '发币账户资产不足，请联系NGD的工作人员或者通过人工通道进行申请。\r\n https://discordapp.com/neo'
  }
};

var app = new Vue({
  el: '#app',
  data: {
    key: '',
    inputDirty: false,
    openedInstruction: false,
    success: false,
    errorText: '',
    userLanguage: sessionStorage.getItem("lan") || (navigator.language || navigator.browserLanguage).split('-')[0]
  },
  mounted: function () {
    var _lan = this.userLanguage;
    sessionStorage.setItem("lan", _lan);
    this.getGit();
  },
  methods: {
    onChange: function () {
      this.inputDirty = true;
      this.success = false;
      this.errorText = '';
    },
    changeLanguage: function () {
      var _lan = this.userLanguage;
      _lan === "zh" ? _lan = "en" : _lan = "zh";
      sessionStorage.setItem("lan", _lan);
      this.userLanguage = _lan;
    },
    getGit:function () {
      fetch("/api/login-user",{
        method: 'get',
        headers: {
            "Content-Type": "application/json"
        },
      }).then(function (res) {
        return res.json();
      }).then(function (data) {
        if(data.success){
          document.getElementById('gitBtn').checked = true;
          document.getElementById('gitBtn').setAttribute("disabled", true);
        }
      })

    },
    checkGit: function (){
      if(document.getElementById('gitBtn').checked){
        if(this.userLanguage === 'zh'){
          alert('Github验证成功，无需重复验证');
        }else {
          alert('Github has been verified without repeated verification');
        }
      }else {
          window.location.href = "/api/login";
      }
    },
    closeInstruction: function () {
      this.openedInstruction = false;
    },
    openInstruction: function () {
      this.openedInstruction = true;
    },
    sendNeo: function (currency) {
      const self = this;
      self.success = false;
      let github = document.getElementById('gitBtn').checked;

      var response = grecaptcha.getResponse();
      if (this.isValid && response.length != 0 && github) {
        var request = {
          address: this.key,
          'g-recaptcha-response': response,
          'asset': currency
        };
        fetch('/api/request', {
          method: 'post',
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json"
          },
        }).then(function (res) {
          return res.json();
        }).then(function (data) {
          self.key = '';
          self.inputDirty = false;
          var responseErr = data.code;
          if (responseErr == 401) {
            window.location.href = data.msg;
          }
          var _lan = sessionStorage.getItem("lan");
          if (!data.success) {
            grecaptcha.reset();
            if (_lan === 'zh') {
              self.errorText = this.responses.zh[responseErr];
            } else {
              self.errorText = this.responses.en[responseErr];
            }
          } else {
            self.errorText = false;
            self.success = true;
          }
        })
      }
      else if (!this.inputDirty && !response) {
        if (this.userLanguage === 'zh') {
          this.errorText = "不正确的地址。请再次检查。";
        } else {
          this.errorText = "Invalid address. Please check your input.";
        }
      }
      else if (!response) {
        if (this.userLanguage === 'zh') {
          this.errorText = "请填写验证码以获取测试币。";
        } else {
          this.errorText = "Please complete the captcha to receive assets.";
        }
      } else if (!this.inputDirty) {
        if (this.userLanguage === 'zh') {
          this.errorText = "不正确的地址。请再次检查。";
        } else {
          this.errorText = "Invalid address. Please check your input.";
        }
      }else if(!github){
        if (this.userLanguage === 'zh') {
            this.errorText = "请添加github验证";
        } else {
            this.errorText = "Please complete GitHub to receive assets.";
        }
      }
    }
  },
  computed: {
    isValid: function () {
      return this.key && WAValidator.validate(this.key, 'NEO');
    }
  }
});
