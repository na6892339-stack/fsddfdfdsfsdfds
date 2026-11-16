function onCreate()
    addHaxeLibrary('MP4Handler', 'vlc')
    addHaxeLibrary('Event', 'openfl.events')

    -- 先にスプライト（表示枠）だけ用意しておく
    makeLuaSprite('videoSprite', '', 0, 0)
    setObjectCamera('videoSprite', 'camGame')
    setScrollFactor('videoSprite', 0, 0)
    addLuaSprite('videoSprite', false)
end

function onSongStart()
    -- カウントダウン終了後、曲の音声が始まる瞬間に動画を再生
    runHaxeCode([[
        var filepath:String = Paths.video('intro');
        
        var video:MP4Handler = new MP4Handler();
        video.playVideo(filepath);
        video.visible = false;
        setVar('video', video);

        FlxG.stage.removeEventListener('enterFrame', video.update);
        video.readyCallback = function() {
            game.getLuaObject('videoSprite').loadGraphic(video.bitmapData);
        }
        video.finishCallback = function() {
            game.remove(game.getLuaObject('videoSprite'));
        }
    ]])
end

function onUpdate(elapsed)
    runHaxeCode([[
        var video = getVar('video');
        if (video != null && video.bitmapData != null) {
            var sprite = game.getLuaObject('videoSprite');
            sprite.loadGraphic(video.bitmapData);
            sprite.setGraphicSize(1280, 720);
            sprite.updateHitbox();
            sprite.screenCenter();
        }
    ]])
end

function onPause()
    runHaxeCode([[
        var video = getVar('video');
        if (video != null) video.pause();
    ]])
end

function onResume()
    runHaxeCode([[
        var video = getVar('video');
        if (video != null) video.resume();
    ]])
end

function onDestroy()
    runHaxeCode([[
        var video = getVar('video');
        if (video != null) video.finishVideo();
    ]])
end

