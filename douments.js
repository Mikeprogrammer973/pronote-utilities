let entry_b_ctrl, sent_b_ctrl
let entry_box, sent_box

entry_b_ctrl = document.getElementById("entry-box-ctrl")
sent_b_ctrl = document.getElementById("sent-box-ctrl")
entry_box = document.getElementById("entry-box-container")
sent_box = document.getElementById("container-sent-box")

entry_b_ctrl.addEventListener("click",()=>{
    entry_b_ctrl.setAttribute("class","btn btn-success")
    sent_b_ctrl.setAttribute("class","btn btn-dark")
    entry_box.style.display="block"
    sent_box.style.display="none"
    refreshEntryBox()
})

sent_b_ctrl.addEventListener("click",()=>{
    entry_b_ctrl.setAttribute("class","btn btn-dark")
    sent_b_ctrl.setAttribute("class","btn btn-success")
    entry_box.style.display="none"
    sent_box.style.display="block"
    refreshSentBox()
})


$('#send-doc').ajaxForm((result)=>{
    //setTimeout(()=>{
        refreshSentBox()
        $('#send-doc').hide(200)
        $('#infog').html(result)
        $('#infog').show(500)
        setTimeout(()=>{
            $('#infog').hide(700)
        },3000)
    //},3000)
})

function getData()
{
    const data = new Date()

    document.getElementById("current-data").value = `${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()}`
    $('#send-doc').css('z-index', get_z_index()+1)
    $('#send-doc').show(100)
}

function getType(fileSelector)
{
    document.getElementById("doc-type").value = fileSelector.files[0].type
}

function getUsers()
{
    let slt = document.getElementById("users-op")
    slt.options.length = 0

    REQUEST("../Globals/docs.php?categoria=get_all_users",(result)=>{
        let users = JSON.parse(result)
        if(users[0].length > 0)
        {
            for(let u = 0; u < users[0].length; u++)
            {
                let op = document.createElement("option")
                op.value = users[0][u]
                op.append(document.createTextNode(users[1][u]))
                slt.add(op)
            }
        }
   })
}

function getView(src)
{
    document.getElementById("doc-view").innerHTML += `<object data='${src}' type='' id='doc-source'></object>`
    $('#doc-view').css('z-index', get_z_index()+1)
    document.getElementById("doc-view").style.display="flex"
}

function dropView()
{
    document.getElementById("doc-source").remove()
    $('#doc-view').hide(50)
}

function refreshSentBox()
{
    set_z_index(spinner)
    spinner.style.display = "flex"
    setTimeout(()=>{
        REQUEST(`../Globals/docs?categoria=get_sent_docs`,(result)=>{
            document.getElementById("sent-docs").innerHTML = result
            spinner.style.display = "none"
        })
    },3000)
}

function refreshEntryBox()
{
    set_z_index(spinner)
    spinner.style.display = "flex"
    setTimeout(()=>{
        REQUEST(`../Globals/docs?categoria=get_entry_docs`,(result)=>{
            document.getElementById("entry-docs").innerHTML = result
            spinner.style.display = "none"
        })
    },3000)
}

function deleteDoc(doc)
{
    set_z_index(spinner)
    spinner.style.display = "flex"
    setTimeout(()=>{
        REQUEST(`../Globals/docs?categoria=delete&doc=${doc}`,(result)=>{
            $('#infog').html(result)
            $('#infog').show(500)
            setTimeout(()=>{
                $('#infog').hide(700)
            },3000)
            spinner.style.display = "none"
            refreshEntryBox()
        })
    },3000)
}