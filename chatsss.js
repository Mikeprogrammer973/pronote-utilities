
let currentMSGcomment
let currentChat = null
let currentCHATtype = null
let currentChatNome
let currentChatImg
let chat_r_users = []
let msg_audio_data = null
let msg_length = -1
let ctrl
let req

// Show comment area 
$('#c-c-txt').click(()=>{
    $('#c-c-txt').attr('class','btn btn-light')
    $('#c-c-audio').attr('class','btn btn-dark')
    $('#c-w-audio').hide(100)
    $('#c-w-txt').show(200)
})
// Hide comment area
$('#c-c-audio').click(()=>{
    $('#c-c-audio').attr('class','btn btn-light')
    $('#c-c-txt').attr('class','btn btn-dark')
    $('#c-w-txt').hide(100)
    $('#c-w-audio').show(200)
})

// Handler add chatroom form events
$('#a-g-setup-2').on('submit',function(e){
    e.preventDefault();
    $(this).ajaxSubmit((result)=>{
        if(result.indexOf("MP77") == -1)
        {
            $('#infog').html(`<p class='alert alert-danger'>${result}</p`)
            $('#add-grupo').hide(300)
            $("#container-c-manager").hide()
            blockUI(document.getElementById("infog"),{"background-color":"black","opacity":.95})
            setTimeout(()=>{
                unblockUI(false)
                $("#container-c-manager").show()
                $('#add-grupo').show(300)
            },3000)
            return
        }
        $('.ch-img-p-prv').attr("src","")
        get_chats()
        addCRusers(result)
    })
})

$('#edit-info-g').ajaxForm((res)=>{
    if(res)
    {
        $('#edit-info-g').hide(200)
        get_chatroom_info()
        $('.ch-img-p-prv').attr("src","")
    }else{
        $('#infog').html(`<p class='alert alert-danger'>Ocorreu um erro ao salvar as alterações!<br><br>ERROR:${res}</p`)
        blockUI(document.getElementById("infog"),{"background-color":"black","opacity":.95})
        setTimeout(()=>{
            unblockUI(false)
        },3000)
    }
})

$('#send-anexo-area').ajaxForm((res)=>{
    if(res)
    {
        $('#send-anexo-area').hide(200)
    }else{
        $('#infog').html(`<p class='alert alert-danger'>Ocorreu um erro ao enviar o arquivo!<br><br>ERROR:${res}</p`)
        blockUI(document.getElementById("infog"),{"background-color":"black","opacity":.95})
        setTimeout(()=>{
            unblockUI(false)
        },3000)
    }
})

ocultar_msg_box()

function comment(msg)
{
    currentMSGcomment = msg
    $('#comment-area-container').show(300)
}

function comment_msg_pkg(type,msg)
{
    let msg_pkg = [type,currentMSGcomment,msg]
    send_msg("comment",msg_pkg)
    $('#comment-area-container').hide(300)
}

function get_chats()
{
    set_z_index(spinner)
    spinner.style.display="flex"
    setTimeout(()=>{
        REQUEST(`../Globals/chat?categoria=get_chats`,(res)=>{
            let result = JSON.parse(res)
            $('#c-m-op-chats').html(result[0])
            result[1].forEach((el)=>{
                set_format_str(document.getElementById(`${el}`), result[2][result[1].indexOf(el)])
            })
            $('#container-c-manager').css("z-index", get_z_index()+1)
            $('#container-c-manager').show(400)
            spinner.style.display="none"
        })
    },2000)
}

function ocultar_msg_box()
{
    document.getElementById("current-chat").style.display="none"
    document.getElementById("chat-msgs").style.display="none"
    document.getElementById("chat-tools").style.display="none"
    setup_painel("undefined")
}
function mostrar_msg_box()
{
    document.getElementById("current-chat").style.display="block"
    document.getElementById("chat-msgs").style.display="block"
    document.getElementById("chat-tools").style.display="flex"
}

function remove_chat()
{
    set_z_index(spinner)
    spinner.style.display="flex"
    REQUEST(`../Globals/chat.php?categoria=remove_chat&type=${currentCHATtype}&ref=${currentChat}&user=self`,(res)=>{
        
        if(res)
        {
            ocultar_msg_box()
            refresh_msg_box()
            $('#infog').html("<p class='alert alert-success'>Conversa removida!</p>")
            clearInterval(req)
        }else{
            $('#infog').html("<p class='alert alert-danger'>"+res+"</p>")
        }
        $('#infog').show(100)
        setTimeout(()=>{
            $('#infog').hide(200)
        },3000)
        spinner.style.display="none"
    })
}

function remove_chtroom()
{
    sset_z_index(spinner)
    spinner.style.display="flex"
    REQUEST(`../Globals/chat.php?categoria=remove_chtroom&ref=${currentChat}`,(res)=>{
        
        if(res)
        {
            ocultar_msg_box()
            setup_painel("undefined")
            $('#container-info-grupo').hide(100)
            $('#infog').html("<p class='alert alert-success'>Grupo removido!</p>")
            clearInterval(req)
        }else{
            $('#infog').html("<p class='alert alert-danger'>"+res+"</p>")
        }
        $('#infog').show(100)
        setTimeout(()=>{
            $('#infog').hide(200)
        },3000)
        spinner.style.display="none"
    })
}

function setup_painel(situation)
{
    const chat_m_op =
    [
        document.getElementById("record-audio"),
        document.getElementById("remove-chat"),
        document.getElementById("info-grupo"),
        document.getElementById("anexar-doc")
    ]
    switch(situation)
    {
        case "undefined":
            currentChat = null
            currentCHATtype = null
            currentChatNome = "Undefined"
            currentChatImg = "null"
            chat_m_op[0].style.display="none"
            chat_m_op[1].style.display="none"
            chat_m_op[2].style.display="none"
            chat_m_op[3].style.display="none"
            break
        case "chat":
            chat_m_op[0].style.display="inline"
            chat_m_op[1].style.display="inline"
            chat_m_op[2].style.display="none"
            chat_m_op[3].style.display="inline"
            break
        case "chatroom":
            chat_m_op[0].style.display="inline"
            chat_m_op[1].style.display="none"
            chat_m_op[2].style.display="inline"
            chat_m_op[3].style.display="inline"
    }
}

function get_messages(type,ref,nome,img)
{
    currentCHATtype = type
    currentChat = ref
    currentChatNome = nome
    currentChatImg = img

    setup_painel(type)
    
    $('.user-c-name').html(set_format_str(document.getElementsByClassName("user-c-name")[0],nome))
    type == "chat"?$('.user-c-profile').attr("src",`data:image/png;base64,${img}`):$('.user-c-profile').attr("src",`${img}`)
    mostrar_msg_box()

    $('#container-c-manager').hide(200)
    if(nome == "Undefined" && img == "null")
    {
        $('#chat-msgs').html("<div class='alert alert-danger'>Essa conversa foi deletada pelo outro participante!</div>")
        return
    }
    msg_length = -1
    refresh_msg_box()
}

function get_full_date()
{
    let d = new Date();
    let hora = d.getHours()
    let min = d.getMinutes()
    let mon = d.getMonth()+1
    let dia = d.getDate()
    return `${dia<10?"0"+dia:dia}/${mon<10?"0"+mon:mon}/${d.getFullYear()} ${hora<10?"0"+hora:hora}:${min<10?"0"+min:min}`
}

function get_chatroom_info()
{
    set_z_index(spinner)
    spinner.style.display="flex"
    REQUEST(`../Globals/chat.php?categoria=get_chrm_info&ref=${currentChat}`,(res)=>{
        $('#current-g-info').html(res)
        spinner.style.display="none"
        $('#container-info-grupo').show(200)
    })
}

function get_more_users()
{
    set_z_index(spinner)
    spinner.style.display="flex"
    REQUEST(`../Globals/chat.php?categoria=get_users_t_add&ref=${currentChat}`,(res)=>{
        $('#list-avl-users').html(res)
        spinner.style.display="none"
        $('#c-add-users-t-g').show(200)
    })
}

function send_msg(type,pkg=null)
{
    if(currentChatNome == "Undefined" && currentChatImg == "null")
    {
        return
    }
    let el_msg_txt = document.getElementById("text-msg")
    let msg = type=="txt"?el_msg_txt.value:msg_audio_data
    let msg_pkg 
    switch(type)
    {
        case "comment":
            msg_pkg = [type, pkg]
            break;
        default:
            msg_pkg = [type, msg]
    }
    msg_pkg.push(get_full_date())
    if(currentChat !== null && currentCHATtype !== null)
    {
        REQUEST(`../Globals/chat.php?categoria=send_msg&type=${currentCHATtype}&msg=${JSON.stringify(msg_pkg)}&ref=${currentChat}`,(result)=>{
            if(!result)
            {
                $('#infog').html(`<p alert alert-danger>${result}</p>`)
                $('#infog').show(200)
                setTimeout(()=>{
                    $('#infog').hide(200)
                },3000)
                return
            }
        })
    }
    el_msg_txt.value = "Message...";
}

function refresh_msg_box()
{
    ctrl = true
    //let worker = new Worker("../Js/chat-worker/worker.js")
    function refresh()
    {
        //worker.postMessage(`chat.php?categoria=get_msgs&ref=${currentChat}&type=${currentCHATtype}&vfy=${msg_length}`)
        /*REQUEST(`../Globals/chat.php?categoria=get_msgs&ref=${currentChat}&type=${currentCHATtype}&vfy=${msg_length}`,(res)=>{
            let result = JSON.parse(res)
            if(msg_length < result[1])
            {
                $('#chat-msgs').html(result[0])
                document.getElementById("chat-msgs").scrollTop = document.getElementById("chat-msgs").scrollHeight
            }
            msg_length = result[1]
        })*/
        let request = window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP")
        request.open("POST",`../Globals/chat.php?categoria=get_msgs&ref=${currentChat}&type=${currentCHATtype}&vfy=${msg_length}`)
        request.send()
        request.onreadystatechange = ()=>{
            if(request.readyState == 4 && request.status == 200)
            {
                let result = JSON.parse(request.responseText)
                if(msg_length < result[1])
                {
                    $('#chat-msgs').html(result[0])
                    document.getElementById("chat-msgs").scrollTop = document.getElementById("chat-msgs").scrollHeight
                }
                msg_length = result[1]
            }
        }
    }
    if(currentChat !== null && currentCHATtype !== null)
    {        
        req = setInterval(refresh,1000)
    }
    /*worker.addEventListener("message",(res)=>{
        window.cancelAnimationFrame(req)
        if(ctrl)
        {
            let result = JSON.parse(res.data)
            msg_length = result[1]
            if(msg_length < result[1])
            {
                $('#chat-msgs').html(result[0])
            }
            ctrl = false
            refresh_msg_box()
        }
    })*/
}

function searchUsers(busca,tipo)
{
    let pos = tipo=="cr"?1:0
    let ref = (isNaN(busca))?"nome_completo":"id_user"
    REQUEST(`../Globals/chat.php?categoria=busca_users&ref=${ref}&busca=${busca}&tipo=${tipo}`,(result)=>{
        $('.result-b-contatos').html(result)
    })
}

function addChat(user)
{
    REQUEST(`../Globals/chat.php?categoria=add_chat&user=${user}`,(result)=>{
        $('#infog').html(`<strong class='alert alert-success'>Conversa criada com sucesso!</strong>`)
        if(!result)
        {
            $('#infog').html(`<p class='alert alert-danger'>${result}</p>`)
        }
        blockUI(document.getElementById("infog"))
        setTimeout(()=>{
            unblockUI(false)
        },3000)
    })
    $('.result-b-contatos').html("")
    $('.cm-s').attr("value","")
    $('#add-contato').hide(200)
    get_chats()
}

function selectingChatrommUsers(user)
{
    if(chat_r_users.indexOf(user) === -1)
    {
        chat_r_users.push(user)
    }
    else
    {
        chat_r_users.splice(chat_r_users.indexOf(user),1)
    }
    document.getElementById("s-s-users").innerHTML = `${chat_r_users.length} selecionado(s)`;
}

function addCRusers(id_chatroom)
{
    /***
     * 
     */
    //alert(id_chatroom)
    REQUEST(`../Globals/chat.php?categoria=add_ch_users&users=${JSON.stringify(chat_r_users)}&chat=${id_chatroom}`,(result)=>{
        $('#infog').html(`<strong class='alert alert-success'>Grupo criado com sucesso!</strong>`)
        if(!result)
        {
            $('#infog').html(`<strong class='alert alert-danger'>${result}</strong>`)
        }
        $('#add-grupo').hide(300)
        $("#container-c-manager").hide()
        blockUI(document.getElementById("infog"))
        setTimeout(()=>{
            unblockUI(false)
            $("#container-c-manager").show()
        },3000)
    })
    chat_r_users.length = 0
    
    document.getElementById("s-s-users").innerHTML = `${chat_r_users.length} selecionado(s)`;
    $('.result-b-contatos').html("")
    $('.cm-s').attr("value","")
    $('#a-g-setup-2').hide(100)
    $('#a-g-setup-1').show(100)
}

function add_chtroom_user(user)
{
    set_z_index(spinner)
    spinner.style.display="flex"
    REQUEST(`../Globals/chat.php?categoria=add_ch_users&users=${JSON.stringify([user])}&chat=${currentChat}`,(res)=>{
        if(!res)
        {
            $('#infog').html("<p class='alert alert-danger'>Ocorreu um erro ao adicionar o participante, tente mais tarde!</p>")
        }
        $('#infog').html("<p class='alert alert-success'>Participante adicionado(a) com sucesso!</p>")
        blockUI(document.getElementById("infog"))
        setTimeout(()=>{
            unblockUI(false)
        },2000)
        spinner.style.display="none"
        get_more_users()
    })
}
function remove_chtroom_user(user,dir)
{
    set_z_index(spinner)
    spinner.style.display="flex"
    REQUEST(`../Globals/chat.php?categoria=remove_chat&type=${currentCHATtype}&ref=${currentChat}&user=${user}`,(res)=>{
       let msg = "";
        if(dir){
        msg = "Grupo removido com sucesso!"
        }else{
            msg ="Participante removido(a) com sucesso!"
        }
        if(!res)
        {
            if(dir){
                msg = "Ocorreu um erro ao remover o grupo!"
            }else{
                msg ="Ocorreu um erro ao remover o participante, tente mais tarde!"
            }
            $('#infog').html(`<p class='alert alert-danger'>${msg}</p>`)
        }
        $('#infog').html(`<p class='alert alert-success'>${msg}</p>`)
        blockUI(document.getElementById("infog"))
        setTimeout(()=>{
            unblockUI(false)
        },2000)
        if(dir)
        {
            ocultar_msg_box()
            setup_painel("undefined")
            $('#container-info-grupo').hide(100)
            clearInterval(req)
        }else{            
            get_chatroom_info()
        }
        spinner.style.display="none"
    })
}

function verify_setup_1()
{
    if(chat_r_users.length == 0)
    {
        $('#infog').html("<strong class='alert alert-danger'>Selecione pelo menos um participante!<strong>")
        blockUI(document.getElementById("infog"),{"background-color":"black","opacity":.95})
        setTimeout(()=>{
            unblockUI(false)
        },2000)
        return
    }
    $('#a-g-setup-1').hide(100)
    $('#a-g-setup-2').css("display", "block")
}

function getIMG(fs)
{
    const file = fs.files[0]

    if(!file.type || !file.type.startsWith("image/"))
    {
        alert("Escolhe uma imagem válida!")
        fs.files = document.getElementById("replace").files
        document.getElementById("ch-img-p-prv").src = ""
        return
    }
    const reader = new FileReader()

    reader.addEventListener('load',(event)=>{
        $('.ch-img-p-prv').attr("src",event.target.result)
        //document.getElementById("ch-img-p-prv").src = event.target.result
    })
    reader.readAsDataURL(file)
}
function record_audio()
{
    $('#infog').html("<p class='alert alert-danger'>Funcionalidade não disponível!</p>")
    $('#infog').show(200)
    setTimeout(()=>{
        $('#infog').hide(200)
    },2000)
}