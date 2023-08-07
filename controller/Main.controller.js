sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox) {
        "use strict";

        return Controller.extend("jogovelha.controller.Main", {
            onInit: function () {
                this.vez = 'X'; //this equivale ao ME-> do ABAP
                // Matriz de possibilidades de vitória

                this.vitorias_possiveis = [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                    [1, 5, 9],
                    [3, 5, 7],
                    [1, 4, 7],
                    [2, 5, 8],
                    [3, 6, 9],
                ]
            },

            // Evento ao clicar na casa
            onClickCasa: function (oEvent) {
                //obter referência do Objeto que foi clicado

                let casa = oEvent.getSource();
                //obter imagem atual
                let imagem = casa.getSrc();

                //verifica se a imagem é branca
                if (imagem == "../img/Branco.png") {
                    casa.setSrc("../img/" + this.vez + ".png")

                    // lógica para verificar ganhador
                    // desvio condicional
                    if (this.temVencedor() == true) {
                        //alert(this.vez + ' ganhou!')
                        MessageBox.success(this.vez + " ganhou!");
                        return;
                    }

                    //troca do jogador
                    if (this.vez == 'X') {
                        this.vez = 'O';
                        //chamar função de jogada do computador
                        this.jogadaComputador();
                    } else {
                        this.vez = 'X';
                    }

                }
            },

            // Função que verifica se há vencedor
            temVencedor: function () {
                if (this.casasIguais(1, 2, 3) ||
                    this.casasIguais(4, 5, 6) ||
                    this.casasIguais(7, 8, 9) ||
                    this.casasIguais(1, 4, 7) ||
                    this.casasIguais(2, 5, 8) ||
                    this.casasIguais(3, 6, 9) ||
                    this.casasIguais(1, 5, 9) ||
                    this.casasIguais(3, 5, 7)) {
                    return true;
                }
            },

            casasIguais: function (a, b, c) {
                // obtenho objetos da tela
                let casaA = this.byId("casa" + a);
                let casaB = this.byId("casa" + b);
                let casaC = this.byId("casa" + c);

                //obtenho imagens da tela
                let imgA = casaA.getSrc();
                let imgB = casaB.getSrc();
                let imgC = casaC.getSrc();

                //verifico se as imagens são iguais
                if ((imgA == imgB) &&
                    (imgB == imgC) &&
                    (imgA != "../img/Branco.png")
                ) {
                    return true;
                }
            },

            jogadaComputador: function () {
                //definir parâmetros iniciais
                //lista de pontos para X
                let listaPontosX = [];
                let listaPontosO = [];

                //lista de jogadas possíveis
                let jogadaInicial = []; //início do jgo
                let jogadaVitoria = []; //vitória é certa
                let jogadaRisco = [];  //risco de perder
                let tentativa_vitoria = [];  //aumenta a chance de vitória

                //CÁLCULO DA PONTUAÇÃO EM CADA POSSIBILIDADE DE VITÓRIA
                //loop em cada possibilidade de vitória
                this.vitorias_possiveis.forEach((combinacao) => {
                    //zera pontos iniciais
                    let pontosX = 0;
                    let pontosO = 0;

                    //dentro das vitórias possíveis fazer um loop para verificar cada casa daquela combinação
                    combinacao.forEach((posicao) => {
                        let casa = this.byId("casa" + posicao);
                        let img = casa.getSrc();
                        //dar pontuação de acordo com quem jogou
                        if (img == "../img/X.png") pontosX++;
                        if (img == "../img/O.png") pontosO++;
                    }
                    );

                    //atribui ponto para combinação de possíveis vitórias
                    listaPontosX.push(pontosX);
                    listaPontosO.push(pontosO);


                }
                );

                //jogar com base na maior pontuação (ou maior prioridade pra não perder)
                //para cada possibilidade de vitória do jogador O ver quantos pontos X tem na mesma combinação
                //loop na lista de pontos do O
                listaPontosO.forEach((posicao, index) => {
                    //ver quantos pontos o jogador O tem
                    //debugger
                    switch (posicao) {
                        case 0: //menor pontuação
                            //ver se X tem 2 pontos, porque é onde estou perdendo
                            if (listaPontosX[index] == 2) {
                                jogadaRisco.push(this.vitorias_possiveis[index]);
                            } else if (listaPontosX[index] == 0) {
                                jogadaInicial.push(this.vitorias_possiveis[index]);
                            }
                            break;

                        case 1: //jogada neutra
                            if (listaPontosX[index] == 1) {
                                jogadaInicial.push(this.vitorias_possiveis[index]);
                            } else if (listaPontosX[index] == 0) {
                                tentativa_vitoria.push(this.vitorias_possiveis[index]);
                            }
                            break;

                        case 2: //vitória mais certa
                            if (listaPontosX[index] == 0) {
                                jogadaVitoria.push(this.vitorias_possiveis[index]);
                            }

                    }
                }
                );

                //jogar na combinação de maior prioridade
                if (jogadaVitoria.length > 0) {
                    //jogar nas combinações de vitória
                    this.jogadaIA(jogadaVitoria);

                } else if (jogadaRisco.length > 0) {
                    //jogar onde posso perder
                    this.jogadaIA(jogadaRisco);

                } else if (tentativa_vitoria.length > 0) {
                    //jogada onde posso tentar ganhar
                    this.jogadaIA(tentativa_vitoria);
                } else if (jogadaInicial.length > 0) {
                    //jogada neutra
                    this.jogadaIA(jogadaInicial);

                }

            },

            jogadaIA: function (dados) {
                //separar números das casas que posso jogar
                let numeros = [];


                //verificar se casa possível de ser jogada está vazia
                //loop nas combinações para ver se casa está vazia
                dados.forEach((combinacao) => {
                    //verificar cada casa individualmente
                    //outro loop
                    combinacao.forEach((num) => {
                        let casa = this.byId("casa" + num);
                        let img = casa.getSrc();
                        if (img == "../img/Branco.png") {
                            numeros.push(num);
                        }
                    }
                    )

                }
                )
                //jogada aleatória nos valores possíveis

                this.jogadaAleatoriaIA(numeros);

            },

            jogadaAleatoriaIA: function (numeros) {
                //math.random gera número aletório entre 0 e 1
                let numeroAleatorio = Math.random() * numeros.length;

                //math.floor pega apenas a parte inteira do número
                let numeroInteiro = Math.floor(numeroAleatorio);

                let jogada = numeros[numeroInteiro];
                let casa = this.byId("casa" + jogada);

                casa.setSrc("../img/O.png");
                if (this.temVencedor() == true) {
                    //alert(this.vez + " ganhou!");
                    MessageBox.success(this.vez + " ganhou!");
                } else {
                    this.vez = 'X';
                }

            }

        });

    });



