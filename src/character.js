import * as BABYLON from '@babylonjs/core';

export class WarriorCharacter {
    constructor(scene) {
        this.scene = scene;
        this.rootMesh = null; // Agora será o nó raiz do modelo carregado
        this.modelMesh = null; // A malha visual real
        this.moveSpeed = 0.15;
        this.inputMap = {};
    }

    async initialize() {
        // --- NOVO: CARREGAMENTO DE MODELO 3D (glTF) ---

        // Url de um modelo de personagem estilizado público (licença CC-BY)
        // Mais tarde você substitui pelo seu próprio: "./assets/models/seu_guerreiro.glb"
        const modelUrl = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb";

        try {
            // ImportMeshAsync carrega o modelo de forma assíncrona
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                "", // Nome das malhas (vazio para todas)
                "", // Subpasta (estamos passando a URL completa no próximo parâmetro)
                modelUrl,
                this.scene
            );

            // O glTF carrega uma hierarquia. Pegamos o primeiro elemento como 'rootMesh'
            this.rootMesh = result.meshes[0];
            this.modelMesh = result.meshes[1]; // Geralmente a malha visual

            // --- AJUSTES DE ESCALA E POSIÇÃO ---
            // Modelos externos vêm em escalas diferentes. Vamos ajustá-lo.
            // (Para a Raposa, precisamos escalonar para baixo)
            this.rootMesh.scaling.scaleInPlace(0.02); // Reduzimos para 2% do tamanho original

            // Posiciona o modelo no chão
            this.rootMesh.position = new BABYLON.Vector3(0, 0, 0);

            console.log("Personagem: Modelo 3D carregado com sucesso.");

        } catch (error) {
            console.error("Erro ao carregar o modelo 3D:", error);
            // Fallback opcional: Criar o cilindro se o modelo falhar
        }
    }

    activateControls(scene) {
        // ... (o código de input continua o mesmo)
        scene.actionManager = new BABYLON.ActionManager(scene);
        
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
                this.inputMap[evt.sourceEvent.key.toLowerCase()] = evt.sourceEvent.type == "keydown";
            })
        );
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
                this.inputMap[evt.sourceEvent.key.toLowerCase()] = evt.sourceEvent.type == "keydown";
            })
        );

        scene.onBeforeRenderObservable.add(() => {
            this.updateMovement();
        });
    }

    updateMovement() {
        if (!this.rootMesh) return;

        let moving = false;
        let directionZ = 0;
        let directionX = 0;

        if (this.inputMap["w"] || this.inputMap["arrowup"]) { directionZ = 1; moving = true; }
        if (this.inputMap["s"] || this.inputMap["arrowdown"]) { directionZ = -1; moving = true; }
        if (this.inputMap["a"] || this.inputMap["arrowleft"]) { directionX = -1; moving = true; }
        if (this.inputMap["d"] || this.inputMap["arrowright"]) { directionX = 1; moving = true; }

        if (moving) {
            const moveVector = new BABYLON.Vector3(directionX, 0, directionZ);
            moveVector.normalize();
            moveVector.scaleInPlace(this.moveSpeed);

            // Importante: No glTF, a orientação 'frente' pode variar.
            // Movemos em relação ao espaço mundial (World Space)
            this.rootMesh.moveWithCollisions(moveVector);

            if (moveVector.length() > 0.001) {
                // Ajustamos a rotação. 
                // Nota: Dependendo do modelo, pode ser necessário somar Math.PI à rotação.
                const targetRotationY = Math.atan2(moveVector.x, moveVector.z);
                
                const slerpSpeed = 0.15;
                this.rootMesh.rotation.y = BABYLON.Scalar.LerpAngle(this.rootMesh.rotation.y, targetRotationY, slerpSpeed);
            }
        }
    }
}