var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {
    const size = 48,
        maze = new Maze(6, 8),
        height = maze.h * size,
        width = maze.w * size
        
    /* scene */
    const scene = new BABYLON.Scene(engine)
    scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.CannonJSPlugin(true, 100))
    /* player */
    const player = new Player(scene, new BABYLON.Vector3(size * 1.5 - width / 2, 6, size * 1.5 - height / 2))
    /* light */
    const h = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, -2, 0), scene)
    const d = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-1, -2, -1), scene)
    d.position = new BABYLON.Vector3(20, 40, 20)
    /* shadwo */
    // const shadowGenerator = new BABYLON.ShadowGenerator(1024, d)
    // shadowGenerator.getShadowMap().renderList.push(player.body)
    /* Mesh */
    const roadmaterialpt = new BABYLON.MarbleProceduralTexture("marble", 512, scene)
    roadmaterialpt.uScale = maze.w
    roadmaterialpt.vScale = maze.h
    const ground = BABYLON.MeshBuilder.CreatePlane('ground', { height, width }, scene)
    ground.rotation.x = Math.PI / 2
    ground.material = new BABYLON.StandardMaterial("road", scene)
    ground.material.diffuseTexture = roadmaterialpt
    // ground.receiveShadows = true
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 }, scene)

    var brickMaterial = new BABYLON.StandardMaterial(name, scene);
    brickMaterial.diffuseTexture = new BABYLON.BrickProceduralTexture(name + "text", 512, scene);
    const boxes = maze.units
        .filter(e => !e.passable)
        .map((e, index) => {
            const box = BABYLON.MeshBuilder.CreateBox('crate' + index, {
                size
            }, scene);
            box.material = brickMaterial
            box.position = new BABYLON.Vector3((e.j + 0.5) * size - width / 2, size / 2, (e.i + 0.5) * size - height / 2)
            return box
        })
    const stairs = BABYLON.Mesh.MergeMeshes(boxes, true, true)
    stairs.physicsImpostor = new BABYLON.PhysicsImpostor(stairs, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0 }, scene)
    
    scene.registerBeforeRender(e => {
        const force = 2 * engine.getDeltaTime()
        if (player.isOnGround()) {
            let velocity = new BABYLON.Vector3(0,0,0)
            if (keys[32]) {
                player.body.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 1200, 0), player.body.getAbsolutePosition())
            } else {
                if (keys[87]) {
                    velocity = velocity.add(player.getFront())
                }
                if (keys[83]) {
                    velocity = velocity.add(player.getBack())
                }
                if (keys[65]) {
                    velocity = velocity.add(player.getLeft())
                }
                if (keys[68]) {
                    velocity = velocity.add(player.getRight())
                }
                player.body.physicsImpostor.setLinearVelocity(velocity.normalize().multiplyByFloats(force, force, force))
            }
            
        }
    })
    /* add mousemove listener, change camera lookat */
    const mousemove = e => {
        player.head.rotate(BABYLON.Axis.X, e.movementY / 1000, BABYLON.Space.LOCAL)
        player.head.rotate(BABYLON.Axis.Y, e.movementX / 1000, BABYLON.Space.WORLD)
    }
    document.addEventListener('pointerlockchange', function () {
        if (document.pointerLockElement === canvas) {
            document.addEventListener("mousemove", mousemove, false);
        } else {
            document.removeEventListener("mousemove", mousemove, false);
        }
    }, false);
    /* add key listener */
    const keys = {}
    window.addEventListener('keydown', e => {
        keys[e.keyCode] = true
        if (e.keyCode === 9) e.preventDefault()
    })
    window.addEventListener('keyup', e => {
        keys[e.keyCode] = false
        if (e.keyCode === 9) e.preventDefault()
    })
    /* window resize */
    window.addEventListener('resize', e => engine.resize())
    /* requestPointerLock */
    scene.onPointerDown = e => canvas.requestPointerLock()
    return scene
}

class Player {
    constructor (scene, position) {
        const body = this.body = new BABYLON.MeshBuilder.CreateSphere("player-body", {diameter: 4}, scene)
        body.position = position
        body.visibility = 0
        const head = this.head = new BABYLON.MeshBuilder.CreateSphere("player-head", {diameter: 4}, scene)
        this.right = new BABYLON.MeshBuilder.CreateSphere("player-right", {diameter: 1}, scene)
        this.right.position = new BABYLON.Vector3(-1, 0, 0)
        this.right.visibility = 0
        this.camera = new BABYLON.UniversalCamera("player-camera", new BABYLON.Vector3(0, 0, -1), scene)
        this.right.parent = this.head
        this.camera.parent = this.head

        scene.registerBeforeRender(e => {
            head.position.x = body.position.x
            head.position.y = body.position.y + 5
            head.position.z = body.position.z
        })
    
        body.physicsImpostor = new BABYLON.PhysicsImpostor(body, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 40, restitution: 0 }, scene);
    }
    getFront () {
        const fuc = this.head.absolutePosition.subtract(this.camera.globalPosition)
        fuc.y = 0
        return fuc.normalize()
    }
    getBack () {
        const fuc = this.camera.globalPosition.subtract(this.head.absolutePosition)
        fuc.y = 0
        return fuc.normalize()
    }
    getRight () {
        const fuc = this.head.absolutePosition.subtract(this.right.absolutePosition)
        fuc.y = 0
        return fuc.normalize()
    }
    getLeft () {
        const fuc = this.right.absolutePosition.subtract(this.head.absolutePosition)
        fuc.y = 0
        return fuc.normalize()
    }
    isOnGround () {
        const info = scene.pickWithRay(new BABYLON.Ray(this.body.position, new BABYLON.Vector3(0, -1, 0)), e => {
            return !(e === this.body)
        })
        return info.hit && (Math.round(info.pickedPoint.y * 1000) / 1000 + 0.1) >= (this.body.getBoundingInfo().minimum.y + this.body.position.y)
    }
}

class Unit {
    constructor(i, j, space, data) {
        this.i = i
        this.j = j
        if (space) {
            this.isVisited = false
            this.passable = true
            this.neighborArray = []
            this.updateNA(data)
        } else {
            this.passable = false
        }
    }
    updateNA(data) {
        const { i, j } = this
        if (data[i][j - 2]) {
            this.neighborArray.push(data[i][j - 2])
            data[i][j - 2].neighborArray.push(this)
        }
        if (data[i - 2]) {
            this.neighborArray.push(data[i - 2][j])
            data[i - 2][j].neighborArray.push(this)
        }
    }
}
class Maze {
    constructor(row, col) {
        this.row = row
        this.col = col

        const h = row * 2 + 1,
            w = col * 2 + 1,
            unitArray = [],
            units = []
        for (let i = 0; i < h; i++) {
            const arr = unitArray[i] = []
            for (let j = 0; j < w; j++) {
                const unit = new Unit(i, j, i % 2 && j % 2, unitArray)
                arr.push(unit)
                units.push(unit)
            }
        }

        this.units = units
        this.h = h
        this.w = w

        let current = unitArray[1][1]
        const visiteds = [current]
        let neighbors
        while (visiteds.length > 0) {
            current.isVisited = true
            neighbors = current.neighborArray.filter(e => !e.isVisited)
            if (neighbors.length > 0) {
                visiteds.push(current)
                const next = neighbors.splice(Math.floor(Math.random() * neighbors.length), 1)[0]
                unitArray[(current.i + next.i) / 2][(current.j + next.j) / 2].passable = true
                current = next
            } else {
                current = visiteds.splice(Math.floor(Math.random() * visiteds.length), 1)[0]
            }
        }

    }
}
var engine;
try {
engine = createDefaultEngine();
} catch(e) {
console.log("the available createEngine function failed. Creating the default engine instead");
engine = createDefaultEngine();
}
    if (!engine) throw 'engine should not be null.';
    scene = createScene();;
    sceneToRender = scene

    engine.runRenderLoop(function () {
        if (sceneToRender) {
            sceneToRender.render();
        }
    });

    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });