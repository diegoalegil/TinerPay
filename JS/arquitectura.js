(function () {

function ready(fn){
    if(document.readyState==="loading"){
        document.addEventListener("DOMContentLoaded",fn)
    }else{
        fn()
    }
}

function center(el){
    const r=el.getBoundingClientRect()
    return{
        x:r.left+r.width/2,
        y:r.top+r.height/2
    }
}

function move(el,x,y){
    el.style.left=x+"px"
    el.style.top=y+"px"
}

function wait(ms){
    return new Promise(r=>setTimeout(r,ms))
}

function pulseNode(node){
    node.classList.add("node-active")
    setTimeout(()=>node.classList.remove("node-active"),900)
}

/* ===== crear paquete ===== */

function createPacket(){

    /* eliminar paquetes anteriores por seguridad */
    document.querySelectorAll(".arch-packet").forEach(p=>p.remove())

    const p=document.createElement("div")
    p.className="arch-packet"

    document.body.appendChild(p)

    return p
}

/* ===== trail ===== */

function trail(x,y){

const t=document.createElement("div")
t.className="packet-trail"

t.style.left=x+"px"
t.style.top=y+"px"

document.body.appendChild(t)

setTimeout(()=>t.remove(),350)

}

/* ===== movimiento paquete ===== */

async function movePacket(packet,target){

    let x,y

    if(target instanceof HTMLElement){
        const c=center(target)
        x=c.x
        y=c.y
    }else{
        x=target.x
        y=target.y
    }

    let prevX=parseFloat(packet.style.left)
    let prevY=parseFloat(packet.style.top)

    const startX=prevX
    const startY=prevY

    const duration=1000
    const startTime=performance.now()

    return new Promise(resolve=>{

        function frame(time){

            const progress=Math.min((time-startTime)/duration,1)

            const px=startX+(x-startX)*progress
            const py=startY+(y-startY)*progress

            /* mover punto */

            packet.style.left=px+"px"
            packet.style.top=py+"px"

            /* estela detrás */

            if(progress>0.02){
                trail(prevX,prevY)
            }

            prevX=px
            prevY=py

            if(progress<1){
                requestAnimationFrame(frame)
            }else{
                resolve()
            }

        }

        requestAnimationFrame(frame)

    })
}

ready(()=>{

    const sendBtn=document.getElementById("arch-send-btn")
    const roach=document.getElementById("roach")
    const api=document.getElementById("arch-api")
    const nodeEU=document.getElementById("arch-node1")
    const nodeUS=document.getElementById("arch-node2")
    const nodeLAT=document.getElementById("arch-node3")

    if(!sendBtn||!roach) return

    let running=false

    sendBtn.addEventListener("click",async e=>{

        if(running) return
        running=true

        e.preventDefault()

        /* ===== cucaracha entra ===== */

        const btnC=center(sendBtn)

        const roachX=btnC.x-230
        const roachY=btnC.y-15

        roach.style.transition="left 2s ease, top 1s ease"

        roach.style.left="-250px"
        roach.style.top=roachY+"px"

        await wait(100)

        move(roach,roachX,roachY)

        await wait(2200)

        /* ===== pulsa botón ===== */

        sendBtn.classList.add("pressed")

        await wait(300)

        sendBtn.classList.remove("pressed")

        /* ===== crear paquete ===== */

        const packet=createPacket()

        packet.style.left=btnC.x+"px"
        packet.style.top=btnC.y+"px"

        /* ===== rodear API ===== */

        const apiBox=api.getBoundingClientRect()

        const points=[
            {x:apiBox.left,y:apiBox.top},
            {x:apiBox.right,y:apiBox.top},
            {x:apiBox.right,y:apiBox.bottom},
            {x:apiBox.left,y:apiBox.bottom}
        ]

        for(const p of points){
            await movePacket(packet,p)
        }

        pulseNode(api)

        /* ===== nodo EU ===== */

        await movePacket(packet,nodeEU)
        pulseNode(nodeEU)

        await wait(700)

        /* ===== replicación ===== */

        await movePacket(packet,nodeUS)
        pulseNode(nodeUS)

        await movePacket(packet,nodeLAT)
        pulseNode(nodeLAT)

        /* ===== desaparecer paquete ===== */

        await wait(500)
        packet.style.opacity=0

        setTimeout(()=>packet.remove(),500)

        /* ===== cucaracha se va ===== */

        await wait(600)

        roach.style.transition="left 1.6s ease"
        roach.style.left="-300px"

        running=false

    })

})

})()