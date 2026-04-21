import * as BABYLON from '@babylonjs/core';
import { WarriorCharacter } from './character.js';

// Importante: Para carregar modelos .glb/.gltf
import "@babylonjs/loaders/glTF";

const canvas = document.getElementById("renderCanvas");

async function createEngine() {
    const webGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
    
    let engine;
    if (webGPUSupported) {
        engine = new BABYLON.WebGPUEngine(canvas);
        await engine.initAsync();
        console.log("Motor: WebGPU inicializado.");
    } else {
        // Fallback para WebGL se WebGPU não estiver disponível
        console.warn("Navegador não suporta WebGPU. Usando WebGL.");
        engine = new BABYLON.Engine(canvas, true);
    }
    return engine;
}

const createScene = async (engine) => {
    const scene = new BABYLON.Scene(engine);

    // Câmera ARC Rotate (pode orbitar ao redor de um ponto)
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, new BABYLON.Vector3(0, 1.5, 0), scene);
    camera.attachControl(canvas, true);

    // Luz Hemisférica Básica
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Um chão simples para referência de mundo aberto
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2); // Verde Grama
    ground.material = groundMaterial;

    // --- INSTANCIANDO O PERSONAGEM ---
    const mainCharacter = new WarriorCharacter(scene);
    await mainCharacter.initialize(); // Espera carregar/criar o modelo
    mainCharacter.activateControls(scene); // Ativa o WASD

    // Opcional: Fazer a câmera seguir o personagem
    camera.lockedTarget = mainCharacter.rootMesh;

    return scene;
};

// --- FLUXO PRINCIPAL ---
(async () => {
    const engine = await createEngine();
    const scene = await createScene(engine);

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
})();