/*!
 * jQuery.mpic
 *
 * @version 1.0
 * @author Kazuhiro Shintani
 * @license MIT License (https://github.com/nbnote/jquery-mpic/blob/master/LICENSE)
 * @link https://github.com/nbnote/jquery-mpic
 */
;
(function( $, window, document, undefined ) {

	var plugname = 'mpic';

	var defaultOptions = {
		numFrames: 0,
		align: 5,
		lq: '',
		hq: '',
		onLoadProgress: function() {},
		onLoadComplete: function() {},
		onUpdate: function() {}
	};


	var methods = {

		_init: function( element, option ) {
			this.options = $.extend( {}, defaultOptions, option );
			this.$element = element;
			this.$element.data( plugname, this );

			var opts = this.options;

			if ( !opts.numFrames || !opts.lq ) return;

			this.$window = $( window );
			this.$document = $( document );
			this.hq = opts.hq !== '';
			this.currentFrame = 0;
			this.width = 0;
			this.height = 0;
			this.winWidth = 0;
			this.winHeight = 0;
			this.running = false;
			this.timerId = 0;
			this.$lq = $( '<img/>' ).css( { position: 'absolute' } );
			this.$hq = $( '<img/>' ).css( { position: 'absolute' } );

			switch ( opts.align ) {
				case 1:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						return {
							width: this.width * scale,
							height: this.height * scale,
							bottom: 0,
							left: 0
						}
					};
					break;
				case 2:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						var setW = this.width * scale;
						return {
							width: setW,
							height: this.height * scale,
							bottom: 0,
							left: (setW - this.winWidth) / 2 * -1
						}
					};
					break;
				case 3:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						return {
							width: this.width * scale,
							height: this.height * scale,
							bottom: 0,
							right: 0
						}
					};
					break;
				case 4:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						var setH = this.height * scale;
						return {
							width: this.width * scale,
							height: setH,
							top: (setH - this.winHeight) / 2 * -1,
							left: 0
						}
					};
					break;
				case 5:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						var setW = this.width * scale;
						var setH = this.height * scale;
						return {
							width: setW,
							height: setH,
							top: (setH - this.winHeight) / 2 * -1,
							left: (setW - this.winWidth) / 2 * -1
						}
					};
					break;
				case 6:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						var setH = this.height * scale;
						return {
							width: this.width,
							height: setH,
							top: (setH - this.winHeight) / 2 * -1,
							right: 0
						}
					};
					break;
				case 7:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						return {
							width: this.width * scale,
							height: this.height * scale,
							top: 0,
							left: 0
						}
					};
					break;
				case 8:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						var setW = this.width * scale;
						return {
							width: setW,
							height: this.height * scale,
							top: 0,
							left: (setW - this.winWidth) / 2 * -1
						}
					};
					break;
				case 9:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						return {
							width: this.width * scale,
							height: this.height * scale,
							top: 0,
							right: 0
						}
					};
					break;
				default:
					this._makeImgStyle = function() {
						var scale = Math.max( this.winWidth / this.width, this.winHeight / this.height );
						var setW = this.width * scale;
						var setH = this.height * scale;
						return {
							width: setW,
							height: setH,
							top: (setH - this.winHeight) / 2 * -1,
							left: (setW - this.winWidth) / 2 * -1
						}
					};
					break;
			}

			var lqList = [];
			var lqPath = opts.lq.split( '{{index}}' );
			var i = 1;
			for ( ; i <= opts.numFrames; i++ ) {
				lqList.push( lqPath[0] + i + lqPath[1] );
			}

			var imgLoader = new ImageLoader( lqList );
			imgLoader.onProgress = $.proxy( this._onLoadProgress, this );
			imgLoader.onComplete = $.proxy( this._onLoadComplete, this );
			imgLoader.load();
		},

		_onLoadError: function( data ) {
			var ev = {
				type: 'loaderror',
				data: data
			};
			this.options.onLoadError.call( this.$element[0], ev );
		},

		_onLoadProgress: function( data ) {
			var ev = {
				type: 'loadprogress',
				percent: data.percent,
				data: data
			};
			this.options.onLoadProgress.call( this.$element[0], ev );
		},

		_onLoadComplete: function( data ) {
			var opts = this.options;
			if ( this.hq ) {
				var hqPath = opts.hq.split( '{{index}}' );
				var i = data.length;
				for ( ; i--; ) {
					data[i].hq = hqPath[0] + (i + 1) + hqPath[1];
				}
			}
			this.dataList = data;

			var ev = {
				type: 'loadcomplete',
				data: this.dataList
			};
			opts.onLoadComplete.call( this.$element[0], ev );

			var img = this.dataList[0].img;
			this.width = img.width;
			this.height = img.height;
			this.$element
			.css( { overflow: 'hidden' } )
			.append( this.$lq );
			if ( this.hq ) {
				this.$element
				.append( this.$hq );
			}

			this.$window
			.on( 'scroll', $.proxy( this._setFrame, this ) )
			.on( 'resize', $.proxy( this._update, this ) );

			this._setFrame();
			this._update();
		},

		_setFrame: function() {
			var scrlHeight = this.$document.height() - this.$window.height();
			var scrlTop = this.$document.scrollTop();
			var rate = scrlHeight / (this.options.numFrames - 1);

			this.currentFrame = Math.floor( scrlTop / rate ) || 0;
			this.$hq.hide();
			this.$lq.attr( { src: this.dataList[this.currentFrame].src } );
			if ( this.hq ) {
				this._setHQImgBegin();
			}

			var ev = {
				type: 'update',
				frameNumber: this.currentFrame + 1,
				data: this.dataList[this.currentFrame]
			};
			this.options.onUpdate.call( this.$element[0], ev );
		},

		_setHQImgBegin: function() {
			if ( this.running ) {
				this.running = false;
				clearTimeout( this.timerId );
			}
			this.running = true;
			var that = this;
			this.timerId = setTimeout( function() {
				that.running = false;
				that._setHQImg();
			}, 500 );
		},

		_setHQImg: function() {
			var img = new Image();
			var src = this.dataList[this.currentFrame].hq;
			var that = this;
			img.onload = function() {
				that.$hq
				.attr( { src: src } )
				.fadeIn( 500 );
			};
			img.src = src;
		},

		_makeImgStyle: function() {},

		_update: function() {
			this.winWidth = this.$window.width();
			this.winHeight = this.$window.height();

			var imgStyle = this._makeImgStyle();

			this.$element.css( {
				width: this.winWidth,
				height: this.winHeight
			} );
			this.$lq.css( imgStyle );
			if ( this.hq ) {
				this.$hq.css( imgStyle );
			}
		}
	};


	$[plugname] = function() {
	};
	$.extend( $[plugname].prototype, methods );

	$.fn[plugname] = function( method ) {
		if ( methods[method] && method.charAt( 0 ) !== '_' ) {
			var arg = arguments;
			if ( method.substr( 0, 3 ) === 'get' ) {
				return methods[method].apply( $( this ).data( plugname ), Array.prototype.slice.call( arg, 1 ) );
			} else {
				return this.each( function() {
					methods[method].apply( $( this ).data( plugname ), Array.prototype.slice.call( arg, 1 ) );
				} );
			}
		} else if ( typeof method === 'object' || !method ) {
			return this.each( function() {
				new $[plugname]()._init( $( this ), method );
			} );
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.' + plugname );
		}
	};


	var ImageLoader = function( list ) {
		this.numPipes = 6;
		this.numImages = 0;
		this.numLoadings = 0;
		this.numLoaded = 0;

		this.registerList = [];
		var i = 0;
		var len = list.length;
		for ( ; i < len; i++ ) {
			this.registerList[i] = { src: list[i] };
		}
		this.loadedList = [];
		this.successList = [];
		this.errorList = [];

		this.onProgress = function( obj ) {};
		this.onError = function( obj ) {};
		this.onComplete = function( list ) {};
	};

	ImageLoader.prototype = {
		load: function() {
			this.numImages = this.registerList.length;

			if ( this.numImages === 0 ) {
				this.onComplete( this.loadedList );
				return;
			}

			var i = 0;
			for ( ; i < this.numImages; i++ ) {
				this.registerList[i].id = i;
			}

			i = 0;
			var len = this.numLoadings = Math.min( this.numPipes, this.numImages );
			for ( ; i < len; i++ ) {
				this._load( this.registerList[i] );
			}
		},

		_next: function() {
			if ( this.numImages === this.numLoaded ) {
				this.onComplete( this.loadedList );
			} else if ( this.numLoadings < this.numImages ) {
				this._load( this.registerList[this.numLoadings] );
				this.numLoadings++;
			}
		},

		_load: function( loadObj ) {
			var that = this;
			var img = loadObj.img = new Image();

			img.onload = function() {
				setTimeout( function() {
					that.numLoaded++;
					loadObj.percent = that.numLoaded / that.numImages * 100 | 0;
					loadObj.result = 'success';
					that.loadedList[ loadObj.id ] = loadObj;
					that.successList.push( loadObj );
					that.onProgress( loadObj );
					that._next();
				}, 25 );
			};

			img.onerror = function() {
				setTimeout( function() {
					that.numLoaded++;
					loadObj.result = 'error';
					that.loadedList[ loadObj.id ] = loadObj;
					that.errorList.push( loadObj );
					that.onError( loadObj );
					that._next();
				}, 25 );
			};

			img.src = loadObj.src || 'none';
		}
	};
})( jQuery, window, document );
