const CHAT = "https://mock-api.driven.com.br/api/v6/uol/participants";
const LOGIN_PERSIST = "https://mock-api.driven.com.br/api/v6/uol/status";
const MENSAGENS = "https://mock-api.driven.com.br/api/v6/uol/messages";
const user = {}

function criarHTML(nome){
    return document.createElement(nome);
}
function logarUsuario() {
    let nameInput = document.querySelector("#userName"); 
    user['name'] = nameInput.value;
    user['type'] = "message"; // mensagens no modo publico
    user['to'] = "Todos";
    nameInput.value = "";
    let promise = axios.post(CHAT, user);
    promise.then(function(a){
        if(a.status === 200){
            irParaUol();
        }
    })
}
function irParaUol(){
    let uolDiv = document.querySelector("#uol");
    let loginDiv = document.querySelector("#login");
    uolDiv.classList.remove('off');
    loginDiv.classList.add('off');
    carregarMensagens();
}
function irParaLogin(){
    let uolDiv = document.querySelector("#uol");
    let loginDiv = document.querySelector("#login");
    uolDiv.classList.add('off')
    loginDiv.classList.remove('off')
}
function alternarMenu(){
    let menuDiv = document.querySelector("#menu");
    menuDiv.classList.toggle('off')
}
function carregarMensagens(){
    let promise = axios.get(MENSAGENS);
    promise.then(function(a){
        let chat = document.querySelector("#chat")
        chat.innerHTML = "";
        a.data.forEach(mensagens=>{
            let mensagemNovaHTML = document.createElement('li');
            let innerMSG = "";
            if(mensagens.type === "message") {
                mensagemNovaHTML.className = "msg_geral";
                innerMSG = `
                    <span class="span_time">(${mensagens.time})</span>
                    <span class="span_name">${mensagens.from}</span>
                    <span> para </span>
                    <span class="span_name">${mensagens.to}</span>
                    <span class="span_mensagens">${mensagens.text}</span>`;
                
                mensagemNovaHTML.innerHTML = innerMSG;
                chat.appendChild(mensagemNovaHTML);
                mensagemNovaHTML.scrollIntoView();
            }else if(mensagens.type === "private_message"){
                if(mensagens.to === user.name || mensagens.from === user.name){
                    mensagemNovaHTML.className = "msg_private";
                    innerMSG = `
                        <span class="span_time">(${mensagens.time})</span>
                        <span class="span_name">${mensagens.from}</span>
                        <span> para </span>
                        <span class="span_name">${mensagens.to}</span>
                        <span class="span_mensagens">${mensagens.text}</span>`;
                        
                    mensagemNovaHTML.innerHTML = innerMSG;
                    chat.appendChild(mensagemNovaHTML);
                    mensagemNovaHTML.scrollIntoView();
                }

            }else if(mensagens.type === "status"){
                mensagemNovaHTML.className = "msg_status";
                innerMSG = `
                    <span class="span_time">(${mensagens.time})</span>
                    <span class="span_name">${mensagens.from}</span>
                    <span> para </span>
                    <span class="span_name">${mensagens.to}</span>
                    <span class="span_mensagens">${mensagens.text}</span>`;
                
                mensagemNovaHTML.innerHTML = innerMSG;
                chat.appendChild(mensagemNovaHTML);
                mensagemNovaHTML.scrollIntoView();
            }
            
        })
    })
}
function enviarMensagem(text){
    let formulario = {
        from: user.name,
        to: user.to,
        text,
        type: user.type
    }

    if(formulario.to === undefined){
        formulario.to = "Todos";
    }
    let promise = axios.post(MENSAGENS, formulario);
    promise.then(function(a){
        if(a.status === 200){
            carregarMensagens();
        }else{
            window.location.reload();
        }
    })
}
function carregarUsuarios(){
    let promise = axios.get(CHAT);
    promise.then(function(participantes){
        
        document.querySelector("#participants").innerHTML = "";
        let li = criarHTML("li"), 
            div = criarHTML("div"),
            ion = criarHTML("ion-icon"),
            span = criarHTML("span"),
            ionChecked = criarHTML('ion-icon');
        
        span.onclick = event =>{ user['to'] = "Todos"; selecionarParticipanteMenu(event)}
        span.textContent = "Todos";
        ion.name = "people";
        ionChecked.name = "checkmark-sharp";
        div.appendChild(ion);
        div.appendChild(span);
        li.appendChild(div);
        li.appendChild(ionChecked)
        document.querySelector("#participants").appendChild(li);

        if(participantes.status === 200){
            participantes.data.forEach(per=>{
                let li_p = criarHTML("li"), 
                    div_p = criarHTML("div"),
                    ion_p = criarHTML("ion-icon"),
                    span_p = criarHTML("span"),
                    ionChecked_p = criarHTML('ion-icon');

                span_p.onclick = event =>{ user['to'] = per.name; selecionarParticipanteMenu(event) }
                span_p.textContent = per.name;
                ion_p.name = "person-circle-sharp";
                ionChecked_p.name = "checkmark-sharp";
                div_p.appendChild(ion_p);
                div_p.appendChild(span_p);
                li_p.appendChild(div_p);
                li_p.appendChild(ionChecked_p);

                li_p
                document.querySelector("#participants").appendChild(li_p);
            })
        }
    });
}

function definirPrivado(){
    document.querySelectorAll("#method li.selected").forEach(a=>{
        a.classList.remove("selected");
    });
    document.querySelector("#method .private").classList.toggle("selected");
    user['type'] = "private_message";
}
function definirPublico(){
    document.querySelectorAll("#method li.selected").forEach(a=>{
        a.classList.remove("selected");
    });
    document.querySelector("#method .public").classList.toggle("selected");
    user['type'] = "message";
}
function selecionarParticipanteMenu(e){
    document.querySelectorAll("#participants li.selected").forEach(a=>{
        a.classList.remove("selected");
    });
    e.target.parentNode.parentNode.classList.toggle("selected");
}

// listeners
document.querySelector('#menu .closer').addEventListener('click', ()=>{
    alternarMenu();
})
document.querySelector("footer ion-icon").addEventListener('click', ()=>{
    let input = document.querySelector("footer input");
    if(input.value !== ""){
        enviarMensagem(input.value)
        input.value = "";
    }
})
document.querySelector("footer input").addEventListener('keydown', (e)=>{
    if(e.key === "Enter" && e.target.value !== ""){
        enviarMensagem(e.target.value)
        e.target.value = "";
    }
})

setInterval(() => {
    if(user.name){
        let promise = axios.post(LOGIN_PERSIST, user);
        carregarMensagens();
    }
}, 1000 * 5);

setInterval(() => {
    if(user.name){
        carregarUsuarios();
    }
}, 1000 * 10);