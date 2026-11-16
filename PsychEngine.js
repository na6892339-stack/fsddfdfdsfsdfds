
(function (window, document) {
    "use strict";

    const VERSION = "0.6.3";

    const PsychEngine = {
        version: VERSION,
        initialized: false,
        paused: false,

        canvas: null,
        ctx: null,

        width: 1280,
        height: 720,

        camera: {
            zoom: 1,
            x: 0,
            y: 0
        },

        hud: {
            visible: true,
            health: 1,
            score: 0,
            combo: 0,
            misses: 0
        },

        keys: {},
        events: {},

        config: {
            background: "#151515",
            showDebug: false
        },

        on(name, callback) {
            if (typeof callback !== "function") return;

            if (!this.events[name]) {
                this.events[name] = [];
            }

            this.events[name].push(callback);
        },

        emit(name, ...args) {
            const listeners = this.events[name];

            if (!listeners) return;

            listeners.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(error);
                }
            });
        },

        createCanvas() {
            let canvas = document.getElementById("psych-engine-canvas");

            if (!canvas) {
                canvas = document.createElement("canvas");
                canvas.id = "psych-engine-canvas";

                document.body.appendChild(canvas);
            }

            canvas.width = this.width;
            canvas.height = this.height;

            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.display = "block";
            canvas.style.background = "#151515";

            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");

            if (!this.ctx) {
                throw new Error("Canvas 2D context unavailable");
            }
        },

        drawBackground() {
            const ctx = this.ctx;

            ctx.fillStyle = this.config.background;
            ctx.fillRect(0, 0, this.width, this.height);
        },

        drawHUD() {
            if (!this.hud.visible) return;

            const ctx = this.ctx;

            ctx.save();

            ctx.fillStyle = "#FFFFFF";
            ctx.font = "24px Arial";

            ctx.fillText(
                "Score: " + this.hud.score,
                30,
                40
            );

            ctx.fillText(
                "Combo: " + this.hud.combo,
                30,
                75
            );

            ctx.fillText(
                "Misses: " + this.hud.misses,
                30,
                110
            );

            ctx.fillStyle = "#555555";
            ctx.fillRect(30, 135, 250, 18);

            ctx.fillStyle = "#55DD55";
            ctx.fillRect(
                30,
                135,
                250 * Math.max(0, Math.min(1, this.hud.health)),
                18
            );

            ctx.restore();
        },

        render() {
            if (!this.ctx) return;

            this.drawBackground();
            this.drawHUD();

            this.emit("render", this.ctx);
        },

        setScore(value) {
            this.hud.score = Number(value) || 0;
        },

        setHealth(value) {
            this.hud.health = Math.max(
                0,
                Math.min(1, Number(value) || 0)
            );
        },

        setCombo(value) {
            this.hud.combo = Math.max(0, Number(value) || 0);
        },

        setMisses(value) {
            this.hud.misses = Math.max(0, Number(value) || 0);
        },

        showHUD(value) {
            this.hud.visible = Boolean(value);
            this.render();
        },

        setBackground(color) {
            this.config.background = color;
            this.render();
        },

        flash(color, duration) {
            const overlay = document.createElement("div");

            Object.assign(overlay.style, {
                position: "fixed",
                inset: "0",
                background: color || "#FFFFFF",
                opacity: "1",
                pointerEvents: "none",
                zIndex: "99999",
                transition: "opacity " + (duration || 500) + "ms"
            });

            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.style.opacity = "0";
            });

            window.setTimeout(() => {
                overlay.remove();
            }, (duration || 500) + 50);
        },

        shake(intensity, duration) {
            const amount = Number(intensity) || 5;
            const time = Number(duration) || 300;

            const canvas = this.canvas;

            if (!canvas) return;

            canvas.animate(
                [
                    { transform: "translate(0, 0)" },
                    { transform: "translate(" + amount + "px, 0)" },
                    { transform: "translate(-" + amount + "px, 0)" },
                    { transform: "translate(0, 0)" }
                ],
                {
                    duration: time,
                    iterations: 2
                }
            );
        },

        initInput() {
            window.addEventListener("keydown", event => {
                this.keys[event.code] = true;

                this.emit("keyDown", event.code);

                if (
                    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]
                    .includes(event.code)
                ) {
                    event.preventDefault();
                }
            });

            window.addEventListener("keyup", event => {
                this.keys[event.code] = false;

                this.emit("keyUp", event.code);
            });
        },

        isKeyPressed(key) {
            return Boolean(this.keys[key]);
        },

        start() {
            const loop = () => {
                if (!this.paused) {
                    this.render();
                }

                window.requestAnimationFrame(loop);
            };

            loop();
        },

        init() {
            if (this.initialized) return;

            try {
                this.createCanvas();
                this.initInput();

                this.initialized = true;

                this.emit("ready");

                this.start();

                console.log(
                    "[PsychEngine] Initialized version " + VERSION
                );
            } catch (error) {
                console.error(
                    "[PsychEngine] Initialization failed:",
                    error
                );
            }
        }
    };

    window.PsychEngine = PsychEngine;

    function initialize() {
        PsychEngine.init();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

})(window, document);
