#jQuery.mpic

スクロールに合わせて動画を再生するコンテンツを実装するjQueryプラグインです。動画とはいっても仕組みは静止画を順番に切り替えパラパラ漫画です。

##Demo

http://nbnote.github.io/jquery-mpic/

##使い方

###静止画を用意する

動画を1フレームごとの静止画で用意します。スクロール時の表示に使う小さく軽量な画像と、スクロール停止時に表示する大きく綺麗な画像の二種類用意しておきます(前者のみでもプラグインは使用可能)。また、ファイル名はどちらも1から始まる通番を付けておいてください。

###HTML

コンテナとなる空要素を記述しておきます。

    <div id="screen"></div>

###CSS

スクロールしても画面上の位置が変わらないよう固定しておきます。

    #screen {
      position: fixed;
    }

###JavaScript

jQueryとjQuery.mpicを読み込ませておき、ターゲット要素にプラグインを必須パラメータを設定して呼び出します。下記の記述にあるパラメータはすべて必須です。imgというフォルダの中にlq_1.jpg～lq_100.jpgの100枚の画像で設定する場合の例となります。
呼び出しと同時にすべての小画像の読み込みを開始、完了後に表示します。

    // DOM Ready
    jQuery(function($){
      	$( '#screen' ).mpic({
      	  numFrames: 100, // 必須。総フレーム数を入力
      	  lq: 'img/lq_{{index}}.jpg' // 必須。小画像のパスを指定。「{{index}}」の部分を通番として処理します
      	});
    });

###基準位置について

画像はウィンドウのサイズに合わせて隙間ができないようリサイズされますが、その際、どの位置を基準にするかを1～9の数字で指定することができます。
1=左下、2=下、3=右下、4=左、5=中央、6=右、7=左上、8=上、9=右上

    // DOM Ready
    jQuery(function($){
      	$( '#screen' ).mpic({
      	  numFrames: 100,
      	  lq: 'img/lq_{{index}}.jpg',
      	  align: 1 // デフォルトは5
      	});
    });

###大画像について

パスを設定しておけばスクロール停止後、自動的に対応する大画像を読み込み・表示します(プリロードはしません)。

    // DOM Ready
    jQuery(function($){
      	$( '#screen' ).mpic({
      	  numFrames: 100,
      	  lq: 'img/lq_{{index}}.jpg',
      	  align: 1,
      	  hq: 'img/hq_{{index}}.jpg' // 小画像と同じように画像のパスを指定
      	});
    });

###イベントについて

いくつかのイベントに対してハンドラを設定でき、また引数で渡されるオブジェクトから色々なデータを参照できます(※ネイティブのEventとは関係ないただのObjectです)。function内のthisの参照はプラグイン呼び出し元の要素(HTMLElement)です。

    // DOM Ready
    jQuery(function($){
      $( '#screen' ).mpic({
        numFrames: 100,
        lq: 'img/lq_{{index}}.jpg',
        align: 1,
        hq: 'img/hq_{{index}}.jpg',
        
        // 小画像の読み込みが一枚完了するごとに呼び出される
        onLoadProgress: function( e ) {
          // イベントタイプ
          console.log( e.type ); // 出力: 'loadprogress'
          // 読み込みの進捗(百分率)
          console.log( e.percent ); // 出力: 10
          
          // 読み込みが完了した画像(Imageオブジェクト)
          console.log( e.data.img ); // 出力: Image
          // 読み込みが完了した小画像のパス
          console.log( e.data.src ); // 出力: 'img/lq_10.jpg'
          // 読み込みが完了した小画像に対応する大画像のパス(設定されている場合)
          console.log( e.data.hq ); // 出力: 'img/hq_10.jpg'
        },
        
        // すべての小画像の読み込みが完了した時に呼び出される
        onLoadComplete: function( e ) {
          // イベントタイプ
          console.log( e.type ); // 出力: 'loadcomplete'
          
          // 読み込み完了したデータ一式
          console.log( e.data ); // 出力: [ { img: Image, src: 'img/lq_1.jpg', hq: 'img/lq_1.jpg' }, ... ]
          console.log( e.data[0].img ); // 出力: Image
          console.log( e.data[0].src ); // 出力: 'img/lq_1.jpg'
          console.log( e.data[0].hq ); // 出力: 'img/hq_1.jpg'
        },
        
        // スクロールによって画像が切り替えられる度に呼び出される
        onUpdate: function( e ) {
          // イベントタイプ
          console.log( e.type ); // 出力: 'update'
          // いま何枚目の画像か
          console.log( e.frameNumber ); // 出力: 10
          
          // 表示されている画像(Imageオブジェクト)
          console.log( e.data.img ); // 出力: Image
          // 表示されている小画像のパス
          console.log( e.data.src ); // 出力: 'img/lq_10.jpg'
          // 表示されている小画像に対応する大画像のパス(設定されている場合)
          console.log( e.data.hq ); // 出力: 'img/hq_10.jpg'
        }
      });
    });


