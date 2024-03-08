String.prototype.injectBefore = function (match, mixin) {
    return this.replace(match, `(${mixin.toString()})();` + match)
}

String.prototype.injectAfter = function (match, mixin) {
    return this.replace(match, match + `(${mixin.toString()})();`)
}


// HB - CreateLathe
// IB - CreateRibbon
const extractNames = script => {
    return {
        ctx: /var (\w+)=\{product/.exec(script)[1],
        scene: /,(\w+)=new F\.Scene\(A\.engine\)/.exec(script)[1],
        players: /\),!(\w+)\[/.exec(script)[1],
        localPlayer: /"fire":document.pointerLockElement&&([^&]+)&&/.exec(script)[1],
        actor: /"shellstreak_start",this\.(\w+)\.(\w+)\./.exec(script)[1],
        mesh: /"shellstreak_start",this\.(\w+)\.(\w+)\./.exec(script)[2],
        MeshBuilder: /playerCollisionMesh=(?:\w+)\.([\w\$]+)/.exec(script)[1],
        CreateBox: /\.Mesh\.(\w+)\("BackgroundSkybox/.exec(script)[1],
        isPlaying: />0&&this.(\w+)&&/.exec(script)[1]
    }
}


window.XMLHttpRequest = class extends window.XMLHttpRequest {
    open(method, url) {
        if (url.includes("shellshock.js")) this.isScript = true

        return super.open(...arguments)
    }

    get response() {
        if (!this.isScript) return super.response

        const script = super.response
        window.shNames = extractNames(script)

        return script
            .injectAfter(`(()=>{`, () => console.log("shellhack injected!"))
            .injectAfter(`console.log("onLoadingComplete"),`, () => {
                /*const send = ys.send
                ys.send = function(data) {
                    //console.log("shellhack ws", data)
                    return send.apply(this, arguments)
                }*/
            })
            .replace(":this.isAtReady()&&this.rofCountdown<=0&&(this.weapon.ammo.rounds>0", ":(true")
            .injectBefore(`${shNames.scene}.render()`, () => {
                const BABYLON = eval(shNames.ctx).BABYLON
                const MeshBuilder = BABYLON[shNames.MeshBuilder]
                const CreateBox = MeshBuilder[shNames.CreateBox]
                const players = eval(shNames.players)
                const localPlayer = eval(shNames.localPlayer)
                const actor = shNames.actor
                const mesh = shNames.mesh
                const isPlaying = shNames.isPlaying

                if (!localPlayer) return

                const enemyOutlineMaterial = new BABYLON.StandardMaterial(
                    "enemyOutlineMaterial",
                    localPlayer.scene
                )
                enemyOutlineMaterial.emissiveColor = enemyOutlineMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0)
                enemyOutlineMaterial.wireframe = true
                
                const allyOutlineMaterial = new BABYLON.StandardMaterial(
                    "allyOutlineMaterial",
                    localPlayer.scene
                )
                allyOutlineMaterial.emissiveColor = allyOutlineMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1)
                allyOutlineMaterial.wireframe = true

                for (let i = 0; i < players.length; i++) {
                    const player = players[i]

                    if (!player || player == localPlayer) continue

                    if (player.shOutline == null) {
                        console.log("shellhack", `creating box for ${player.name}`)
                        const outline = CreateBox(
                            "playerOutline",
                            { width: 0.5, height: 0.75, depth: 0.5 },
                            player.scene
                        )
                        outline.position.y = 0.3
                        outline.renderingGroupId = 1
                        outline.alwaysSelectAsActiveMesh = true

                        outline.parent = player[actor][mesh]
                        player.shOutline = outline
                    }

                    player.shOutline.material = (localPlayer.team === 0 || localPlayer.team !== player.team)
                        ? enemyOutlineMaterial
                        : allyOutlineMaterial

                    player.shOutline.isVisible = player[isPlaying]
                }

                if (localPlayer.scope) localPlayer.fire()
            })
    }
}