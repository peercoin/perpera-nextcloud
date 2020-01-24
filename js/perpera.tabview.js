(function() {

  var PerperaTabView = OCA.Files.DetailTabView.extend({

    id: 'perperaTabView',
    className: 'tab perperaTabView',
    perpera: '',
    network: '',
    reference: '',
    hashAlgo: 'sha2-256',
    hash: '',
    wif: '',
    wifshow: false,
    wiferr: '',
    fee: -1,
    txid: '',
    success: true,
    sendError: '',

    /**
     * get label of tab
     */
    getLabel: function() {

      return t('perpera', 'Perpera');

    },

    /**
     * get icon of tab
     */
    getIcon: function() {

      return 'icon-info';

    },

    /**
     * show tab only on files
     */
    canDisplay: function(fileInfo) {

      if(fileInfo != null) {
        if(!fileInfo.isDirectory()) {
          return true;
        }
      }
      return false;

    },

    /**
     * Renders this details view
     *
     * @abstract
     */
    render: function() {
      this.wif = '';
      this.wiferr = '';
      this.wifshow = false;
      this.fee = -1;
      this.reference = '';
      this.txid = '';
      this.success = true;
      this.sendError = '';
      this.perpera = window['perpera'];
      this.network = window['perpera'].networks['peercoin-testnet'];
      this.hashAlgo = "sha2-256";

      this._renderWaiting(this.$el);
      this.getHash();
    },

    /**
     * ajax callback for generating hash
     */
    getHash: function() {
      var fileInfo = this.getFileInfo();
      if(null == fileInfo) {
        _self.updateDisplay({
          response: 'error',
          msg: t('perpera', 'No fileinfo provided.')
        });

        return;
      }

      var url = OC.generateUrl('/apps/perpera/hash'),
          data = {source: fileInfo.getFullPath(), type: this.hashAlgo},
          _self = this;
      $.ajax(
        {
          type: 'GET',
          url: url,
          dataType: 'json',
          data: data,
          async: true,
          success: function(data) {
            if ('success' == data.response) {
              _self.hash = data.msg;
              _self._renderPage();
            }
            else {
              _self._renderReload(data.msg);
            }
          }
        }
      );
    },

    /**
     * Renders for waiting view
     */
    _renderWaiting: function($el){
      this.$el.html(
        '<div style="text-align:center; word-wrap:break-word;" class="waiting"><p><img src="'
        + OC.imagePath('core','loading.gif')
        + '"><br><br></p><p>'
        + t('perpera', 'Wait for a minute ...')
        + '</p></div>'
      );
    },

    /**
     * Renders for reload view
     */
    _renderReload: function(msg) {
      msg += '<br><br><a id="reload-perpera" class="icon icon-history" style="display:block" href=""></a>';
      this.$el.html(msg);

      this.delegateEvents({
        'click #reload-perpera': '_onReloadEvent'
      });
    },

    /**
     * reload event
     */
    _onReloadEvent: function(ev) {
      ev.preventDefault();
      this.render();
    },

    /**
     * Renders for details page view
     */
    _renderPage: function() {
      var html =
        '<div class="hash">'
        + '<div class="label" id="hash-algo">' + this.hashAlgo + '</div>'
        + '<div class="hash-string">' + this.hash + '</div>'
        + '</div>';
      if (this.fee == -1) {
        html += '<div class="form">'
          +   '<label>Insert your WIF:<i id="show-wif" class="eye' + (this.wifshow ? '-slash' : '') + '-regular"></i></label>'
          +   '<input id="input-wif" class="form-field" autocorrect="false" placeholder="Type WIF here..." type="' + (this.wifshow ? 'text' : 'password') + '" value="">'
          +   (this.wiferr == '' ? '' : '<div class="warning"><label>' + this.wiferr + '</label></div>')
          +   '<button id="calc-fee">Calculate Fee</button>'
          + '</div>';
      }
      else {
        html += '<div class="form">'
          +   '<label>Insert your WIF:<i id="show-wif" class="eye' + (this.wifshow ? '-slash' : '') + '-regular"></i></label>'
          +   '<input id="input-wif" class="form-field" autocorrect="false" placeholder="Type WIF here..." type="' + (this.wifshow ? 'text' : 'password') + '" value="">'
          +   '<div class="success"><label>Transaction Fee: ' + this.fee + '</label></div>'
          +   (this.success == false || this.txid == '' ? '<button id="send-tx">Register</button>' : '')
          +   (this.sendError == '' ? '' : '<div class="warning"><label>' + this.sendError + '</label></div>')
          +   (this.success == true && this.txid != '' ? '<div class="hash"><div class="hash-string success">Register Success<br>TxID: ' + this.txid + '</div></div>' : '')
          + '</div>';
      }

      this.$el.html(html);

      this.$el.find("#input-wif").val(this.wif);
      
      this.delegateEvents({
        'click #hash-algo': '_onChangeHashAlgo',
        'change #input-wif': '_onChangeWif',
        'click #calc-fee': '_onCalcFee',
        'click #send-tx': '_onRegister',
        'click #show-wif': '_onShowWif'
      });
    },

    /**
     * hash algorithm change event
     */
    _onChangeHashAlgo: function() {
      if (this.hashAlgo == "sha2-256") {
        this.hashAlgo = "sha2-512";
      }
      else if (this.hashAlgo == "sha2-512") {
        this.hashAlgo = "sha3-256";
      }
      else if (this.hashAlgo == "sha3-256") {
        this.hashAlgo = "sha3-512";
      }
      else if (this.hashAlgo == "sha3-512") {
        this.hashAlgo = "sha2-256";
      }

      this.fee = -1;
      this.getHash();
    },

    /**
     * wif change event
     */
    _onChangeWif: function(ev) {
      this.wif = $(ev.currentTarget).val();

      if (this.fee != -1 || this.wiferr != "") {
        this.fee = -1;
        this.wiferr = "";
        this._renderPage();
      }
    },

    /**
     * wif show/hide event
     */
    _onShowWif: function(ev) {
      this.wifshow = !this.wifshow;
      this._renderPage();
    },

    /**
     * fee calculate event
     */
    _onCalcFee: function() {
      this.sendError = "";
      this.success = true;
      this.txid = "";

      this._renderWaiting();
      try {
        let hashAlgo = this.hashAlgo;
        let hash = this.hash;
        let wif = this.wif;
  
        const doc = new this.perpera.Document(hash, this.network);
        const spender = this.perpera.Spender.fromWIF(wif.trim(), this.network);
        _self = this;
        spender.sync().then(
          () => {
            try {
              const update = doc.considerUpdatingContent({hashAlgo: hash}, spender);
              _self.reference = update;
              _self.fee = (update.getFee() / 10**6);
              _self._renderPage();
            } catch (e) {
              this._onError(e);
            }
          },
          (e) => {
            this._onError(e);
          }
        );
      } catch (e) {
        this._onError(e);
      }
    },

    /**
     * register event
     */
    _onRegister: function() {
      _self = this;
      try {
        this.reference.commit().then(
          (result) => {
            _self.txid = result;
            _self.success = true;
            _self._renderPage();
          },
          (e) => {
            _self.success = false;
            _self.sendError = "Register Failed. Try again.";
            this._renderPage(e);
          }
        );
      } catch (e) {
        this._onError(e);
      }
    },

    /**
     * error event
     */
    _onError: function(e) {
      if (e.toString().includes("Insufficient funds")) {
        this.wiferr = "Your wallet has no funds.";
      }
      else {
        this.wiferr = "WIF invalid.";
      }
      this._renderPage();
    }

  });

  OCA.Perpera = OCA.Perpera || {};

  OCA.Perpera.PerperaTabView = PerperaTabView;

})();
