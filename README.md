# Babylon.jsでFPS(First Person Shooter)視点のテスト
Babylon.jsを使用して、FPS視点画面を作成するテンプレート  

## SetUP
このリポジトリを使って、動かしてみる手順
```shell-session
cd <repo>
npm install
npm run dev
```
## 一から作る
自分でプロジェクトを作る手順
```shell-session
npm create vite@latest
> vanila js
cd <proj_dir>
```

main.jsとscene.jsに分けて書いている。  
Babylon.jsの描画は基本的にはcanvasタグに埋め込む。  

## 参考
[FPS Template@CodePen](https://codepen.io/hiteshsahu/pen/BaKpNqL?editors=0010)  
[vite](https://ja.vitejs.dev/guide/#%E6%9C%80%E5%88%9D%E3%81%AE-vite-%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%82%92%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B)# babylon-fps
