let estadoPokedex = {
    digitando: false
};

let numPokemon = '';

// Elementos do teclado
const key1 = document.querySelector('#key-1');
const key2 = document.querySelector('#key-2');
const key3 = document.querySelector('#key-3');
const key4 = document.querySelector('#key-4');
const key5 = document.querySelector('#key-5');
const key6 = document.querySelector('#key-6');
const key7 = document.querySelector('#key-7');
const key8 = document.querySelector('#key-8');
const key9 = document.querySelector('#key-9');
const key10 = document.querySelector('#key-10');

// Botões da Pokédex
const btnWhiteLeft = document.querySelector('#btn-white-left');
const btnWhiteRight = document.querySelector('#btn-white-right');
const btnLeft = document.querySelector('#btn-left');
const btnRight = document.querySelector('#btn-right');
const btnShiny = document.querySelector('#led-yellow');
const btnUp = document.querySelector('#btn-up');
const btnDown = document.querySelector('#btn-down');

// Telas de exibição
const numberDisplay = document.querySelector('#number-display');
const infoScreen = document.querySelector('#info-screen');
const mainScreen = document.querySelector('#main-screen');

// Eventos das teclas
const teclas = [
    [key1, '1'],
    [key2, '2'],
    [key3, '3'],
    [key4, '4'],
    [key5, '5'],
    [key6, '6'],
    [key7, '7'],
    [key8, '8'],
    [key9, '9'],
    [key10, '0']
];

teclas.forEach(([botao, numero]) => {
    botao.addEventListener('click', () => leituraTeclado(numero));
});

btnWhiteLeft.addEventListener('click', buscarPokemon);
btnWhiteRight.addEventListener('click', apagar);

// Navegação entre os Pokémon
btnRight.addEventListener('click', () => mudarPokemon(1));
btnLeft.addEventListener('click', () => mudarPokemon(-1));
btnUp.addEventListener('click', () => mudarPokemon(10));
btnDown.addEventListener('click', () => mudarPokemon(-10));

// Altera o número do Pokémon conforme o botão pressionado
function mudarPokemon(valor) {
    let novoNumero = Number(numPokemon) + valor;

    if (novoNumero >= 0 && novoNumero <= 1025) {
        numPokemon = String(novoNumero);
        estadoPokedex.digitando = true;
        atualizarNumero(numPokemon);
    }
}

// Recebe os números digitados
function leituraTeclado(tecla) {
    if (!estadoPokedex.digitando) {
        infoScreen.textContent = '';
        numPokemon = '';
        estadoPokedex.digitando = true;
    }

    numPokemon += tecla;
    infoScreen.textContent = numPokemon;
}

// Remove o último número digitado
function apagar() {
    if (!estadoPokedex.digitando) return;

    numPokemon = numPokemon.slice(0, numPokemon.length - 1);

    if (numPokemon === '') {
        estadoPokedex.digitando = false;
        infoScreen.textContent = 'Aguardando dados…';
    } else {
        infoScreen.textContent = numPokemon;
    }

    numberDisplay.textContent = '#000';
    mainScreen.innerHTML = 'Nenhum Pokémon carregado';
}

function mostrarNumero(id) {
    if (Number(numPokemon) === 0 || Number(numPokemon) > 1025) {
        numberDisplay.textContent = '#000';
        return;
    }

    numberDisplay.textContent = `#${numPokemon}`;
}

// Formata o número para aparecer com três dígitos
function atualizarNumero(id) {
    let numeroFormatado = String(id).padStart(3, '0');
    numberDisplay.textContent = '#' + numeroFormatado;
}

// Consulta as informações na PokéAPI
async function consultarApi(msg) {
    try {
        const respostaPokemon = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${msg}`
        );

        const dadosPokemon = await respostaPokemon.json();

        const respostaEspecie = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${msg}/`
        );

        const dadosEspecie = await respostaEspecie.json();

        carregarFoto(dadosPokemon.id);
        atualizarNumero(dadosPokemon.id);
        exibirDados(dadosPokemon, dadosEspecie);

    } catch (erro) {
        console.log(erro);
    }
}

// Inicia a pesquisa do Pokémon
function buscarPokemon() {
    if (estadoPokedex.digitando && numPokemon !== '') {
        consultarApi(numPokemon);
    }
}

// Carrega a imagem correspondente
async function carregarFoto(img) {
    try {
        if (img <= 0 || img > 1025) {
            mainScreen.innerHTML = 'NÃO ENCONTRADO';
            return;
        }

        const imagemPokemon = document.createElement('img');

        imagemPokemon.src =
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${img}.png`;

        if (window.innerWidth < 600) {
            imagemPokemon.style.width = '70px';
        } else {
            imagemPokemon.style.width = '160px';
            imagemPokemon.style.transform = 'translate(0, -12px)';
        }

        mainScreen.innerHTML = '';
        mainScreen.appendChild(imagemPokemon);

    } catch (erro) {
        console.log(erro.message);
    }
}

// Identifica a região de origem pela geração
function descobrirRegiao(especie) {
    const geracao = especie.generation.name;

    const regioes = {
        'generation-i': 'Kanto',
        'generation-ii': 'Johto',
        'generation-iii': 'Hoenn',
        'generation-iv': 'Sinnoh',
        'generation-v': 'Unova',
        'generation-vi': 'Kalos',
        'generation-vii': 'Alola',
        'generation-viii': 'Galar',
        'generation-ix': 'Paldea'
    };

    return regioes[geracao] || 'Desconhecida';
}

// Exibe os dados encontrados
function exibirDados(data, especie) {
    infoScreen.textContent = '';

    const nome = document.createElement('p');
    nome.textContent = capitalizar(data.name);
    nome.style.fontSize = '1.5rem';
    nome.style.fontWeight = 'bold';

    const tipo = document.createElement('p');
    tipo.textContent = 'Tipo: ' + capitalizar(data.types[0].type.name);

    const pesoAltura = document.createElement('p');

    const pesoKg = data.weight / 10;
    let peso = 0;
    let unidadePeso = '';

    if (pesoKg < 1) {
        peso = Math.round(pesoKg * 1000);
        unidadePeso = 'g';
    } else {
        peso = Math.round(pesoKg);
        unidadePeso = 'Kg';
    }

    const regiao = document.createElement('p');
    regiao.textContent = 'Região: ' + descobrirRegiao(especie);

    pesoAltura.textContent = `Peso: ${data.weight / 10}kg`;
    pesoAltura.textContent += ` | Altura: ${data.height / 10}m`;

    infoScreen.append(nome, tipo, pesoAltura, regiao);
}

// Coloca a primeira letra em maiúscula
function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}