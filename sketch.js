// Variáveis para as raquetes, bola e barras horizontais
let raqueteJogador, raqueteComputador, bola, barraSuperior, barraInferior;
let fundoImg, bolaImg, barra1Img, barra2Img;
let bounceSound, golSound;
let btnComecar, btnPausar, btnTerminar;
let jogoAtivo = false;  // Variável para controlar se o jogo está ativo ou pausado


let placarJogador = 0;
let placarComputador = 0;

function preload() {
  fundoImg = loadImage('sprites/fundo1.png');
  bolaImg = loadImage('sprites/bola.png');
  barra1Img = loadImage('sprites/barra01.png');
  barra2Img = loadImage('sprites/barra02.png');
  bounceSound = loadSound('sons/batidaraquete.wav');
  golSound = loadSound('sons/somdegol.wav');
}


function setup() {
  let x = (windowWidth - 800) / 2;
  let y = (windowHeight - 400) / 2;
  createCanvas(800, 400).position(x, y);
  raqueteJogador = new Raquete(30, height / 2, 10, 60);
  raqueteComputador = new Raquete(width - 40, height / 2, 10, 60);
  bola = new Bola(10);
  barraSuperior = new Barra(0, 0, width, 5);
  barraInferior = new Barra(0, height, width, 5);

   // Criando os botões de controle
   btnComecar = createButton('Começar jogo');
   btnComecar.position(10, height + 10);
   btnComecar.mousePressed(comecarJogo);
 
   btnPausar = createButton('Pausar jogo');
   btnPausar.position(100, height + 10);
   btnPausar.mousePressed(pausarJogo);
   btnPausar.attribute('disabled', true);  // Desabilita até que o jogo comece
 
   btnTerminar = createButton('Terminar Jogo');
   btnTerminar.position(200, height + 10);
   btnTerminar.mousePressed(terminarJogo);
   btnTerminar.attribute('disabled', true);  // Desabilita até que o jogo comece
}

function draw() {
  if (!jogoAtivo) {
    return; // Se o jogo não estiver ativo, não faz nada
  }

  // Continuar o desenho normalmente se o jogo estiver ativo
  let escala = Math.max(width / fundoImg.width, height / fundoImg.height);
  let imgWidth = fundoImg.width * escala;
  let imgHeight = fundoImg.height * escala;
  let imgX = (width - imgWidth) / 2;
  let imgY = (height - imgHeight) / 2;
  image(fundoImg, imgX, imgY, imgWidth, imgHeight);
  
  // Atualiza as posições das raquetes, bola e barras horizontais
  raqueteJogador.atualizar();
  raqueteComputador.atualizar();
  bola.atualizar(barraSuperior, barraInferior);  // Aqui é onde a bola ainda estava sendo atualizada

  // Verifica colisões entre bola e raquetes
  bola.verificarColisaoRaquete(raqueteJogador);
  bola.verificarColisaoRaquete(raqueteComputador);

  // Desenha as raquetes, a bola e as barras horizontais
  raqueteJogador.exibir();
  raqueteComputador.exibir();
  bola.exibir();
  barraSuperior.exibir();
  barraInferior.exibir();
}

function comecarJogo() {
  jogoAtivo = true;
  placarJogador = 0;
  placarComputador = 0;
  bola.reiniciar();
  btnPausar.attribute('disabled', false);
  btnTerminar.attribute('disabled', false);
  btnComecar.attribute('disabled', true);  // Desabilita o botão de começar
}

function pausarJogo() {
  jogoAtivo = false;  // Defina jogoAtivo como falso para pausar o jogo
  btnPausar.attribute('disabled', true); // Desabilita o botão de pausar
  btnComecar.attribute('disabled', false);  // Habilita o botão de começar
}

function terminarJogo() {
  jogoAtivo = false;  // Defina jogoAtivo como falso para terminar o jogo
  placarJogador = 0;
  placarComputador = 0;
  bola.reiniciar();
  btnPausar.attribute('disabled', true);  // Desabilita o botão de pausar
  btnComecar.attribute('disabled', false);  // Reativa o botão de começar
  btnTerminar.attribute('disabled', true);  // Desabilita o botão de terminar
}



class Raquete {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  atualizar() {
    if (this === raqueteJogador) {
      this.y = mouseY;
    } else {
      if (bola.y > this.y + this.h / 2) {
        this.y += 3;
      } else if (bola.y < this.y - this.h / 2) {
        this.y -= 3;
      }
    }
    this.y = constrain(this.y, this.h / 2 + barraSuperior.h, height - this.h / 2 - barraInferior.h);
  }

  exibir() {
    let img;
    if (this === raqueteJogador) {
      img = barra1Img;
    } else {
      img = barra2Img;
    }
    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    scale(this.h / 400.0); // Escala as imagens para metade do tamanho
    image(img, 0, 0, img.width, img.height);
    pop();
  }
}

class Bola {
  constructor(r) {
    this.r = r;
    this.reiniciar();
  }
  
  aumentarVelocidade() {
    const fatorAumento = 1.1;
    this.velocidadeX *= fatorAumento;
    this.velocidadeY *= fatorAumento;
  }

  reiniciar() {
    this.anguloRotacao = 0;
    this.x = width / 2;
    this.y = height / 2;
    this.velocidadeX = random([-4, -3, 3, 4]);
    this.velocidadeY = random(-3, 3);
  }

  atualizar(barraSuperior, barraInferior) {
    this.x += this.velocidadeX;
    this.y += this.velocidadeY;

    if (
      this.y - this.r / 2 <= barraSuperior.y + barraSuperior.h ||
      this.y + this.r / 2 >= barraInferior.y - barraInferior.h
    ) {
      this.velocidadeY *= -1;
    }

    if (this.x + this.r / 2 >= width) {
      this.reiniciar();
      tocarSomDeGol();
      placarComputador++;
    } else if (this.x - this.r / 2 <= 0) {
      raqueteComputador.y = random(height - raqueteComputador.h);
      this.reiniciar();
      tocarSomDeGol();
      placarJogador++;
     
    }
    
    this.anguloRotacao += Math.atan2(this.velocidadeY, this.velocidadeX) / 5;

  }
verificarColisaoRaquete(raquete) {
  if (
    this.x - this.r / 2 <= raquete.x + raquete.w / 2 &&
    this.x + this.r / 2 >= raquete.x - raquete.w / 2 &&
    this.y + this.r / 2 >= raquete.y - raquete.h / 2 &&
    this.y - this.r / 2 <= raquete.y + raquete.h / 2
  ) {
    // Inverte a direção horizontal da bola
    this.velocidadeX *= -1;

    // Calcula a posição relativa da bola na raquete (entre -0.5 e 0.5)
    let posicaoRelativa = (this.y - raquete.y) / raquete.h;

    // Define o ângulo da bola após a colisão
    let anguloBola = posicaoRelativa * PI / 3 * 2.3;

    // Atualiza a velocidade vertical da bola com base no ângulo
    this.velocidadeY = this.velocidadeX * Math.tan(anguloBola);

    // Aumenta a velocidade da bola
    this.aumentarVelocidade();
    
    tocarSomColisao();

  }
}

  exibir() {
    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    scale(2 * this.r / 318); // Escala a imagem para metade do tamanho
    rotate(this.anguloRotacao);
    image(bolaImg, 0, 0, bolaImg.width, bolaImg.height);
    pop();
  }
}

class Barra {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  exibir() {
    fill(color("#2B3FD6"));
    rectMode(CENTER);
    rect(this.x + this.w / 2, this.y, this.w, this.h);
  }
}


function tocarSomColisao() {
  bounceSound.play();
}

function tocarSomDeGol() {
  golSound.play();
  // Atraso de 1 segundo (1000 ms) para a narração
  setTimeout(() => {
    narrarPlacar();
  }, 700);  // Ajuste o tempo do atraso conforme necessário
}


function narrarPlacar() {
  const mensagem = `${placarComputador} a ${placarJogador}`;

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(mensagem);
  utterance.lang = 'pt-BR';
  synth.speak(utterance);
}

