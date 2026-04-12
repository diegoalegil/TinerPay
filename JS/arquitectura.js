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

function trail(x,y,color){

const t=document.createElement("div")
t.className="packet-trail"

if(color==="red"){
    t.style.background="radial-gradient(circle,#ff3b3b 0%,rgba(255,59,59,.6) 40%,transparent 70%)"
}else if(color==="green"){
    t.style.background="radial-gradient(circle,#00ff88 0%,rgba(0,255,136,.6) 40%,transparent 70%)"
}

t.style.left=x+"px"
t.style.top=y+"px"

document.body.appendChild(t)

setTimeout(()=>t.remove(),350)

}

/* ===== movimiento paquete ===== */

async function movePacket(packet,target,trailColor){

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
                trail(prevX,prevY,trailColor)
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
    let transferCount=0

    sendBtn.addEventListener("click",async e=>{

        if(running) return
        running=true
        transferCount++
        const isFail=(transferCount===3)

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

        /* ===== nodo US ===== */

        await movePacket(packet,nodeUS)
        pulseNode(nodeUS)

        await wait(700)

        /* ===== nodo LATAM ===== */

        await movePacket(packet,nodeLAT)

        if(!isFail){

            /* ─── ÉXITO ─── */
            pulseNode(nodeLAT)

            await wait(500)
            packet.style.opacity=0
            setTimeout(()=>packet.remove(),500)

            await wait(600)

            roach.style.transition="left 1.6s ease"
            roach.style.left="-300px"

            running=false

        }else{

            /* ─── FALLO ÉPICO en nodo LATAM ─── */

            /* 1. Parpadeo previo del nodo */
            nodeLAT.classList.add("arch-node-flicker")
            packet.classList.add("packet-error")

            await wait(600)

            nodeLAT.classList.remove("arch-node-flicker")
            nodeLAT.classList.add("arch-node-error")

            /* 2. Screen shake + flash */
            document.body.classList.add("screen-shake-epic")
            setTimeout(()=>document.body.classList.remove("screen-shake-epic"),700)

            const flash=document.createElement("div")
            flash.className="screen-flash"
            document.body.appendChild(flash)
            setTimeout(()=>flash.remove(),650)

            const vignette=document.createElement("div")
            vignette.className="red-alert"
            document.body.appendChild(vignette)
            setTimeout(()=>vignette.remove(),6000)

            /* 3. Explosión épica en nodeLAT */
            if(typeof crearExplosionEpica==="function") crearExplosionEpica(nodeLAT)
            if(typeof crearDebris==="function") crearDebris(nodeLAT)

            /* Ondas de choque */
            ;[0,280,560].forEach(delay=>{
                setTimeout(()=>{
                    const wave=document.createElement("div")
                    wave.className="shockwave"
                    nodeLAT.appendChild(wave)
                    setTimeout(()=>wave.remove(),950)
                },delay)
            })

            /* EMP cian */
            setTimeout(()=>{
                const emp=document.createElement("div")
                emp.className="shockwave-cyan"
                nodeLAT.appendChild(emp)
                setTimeout(()=>emp.remove(),1000)
            },180)

            await wait(400)

            /* 4. Errores flotantes */
            const errorLog=document.createElement("div")
            errorLog.className="error-log-overlay"
            errorLog.innerHTML=
                "<div>❌ ERROR: Nodo LATAM no responde</div>"+
                "<div>❌ ERROR: Commit timeout (5 000 ms)</div>"+
                "<div>❌ ERROR: Quorum perdido — sin consenso</div>"+
                "<div>⚠&nbsp;&nbsp;ALERT: Transacción comprometida</div>"+
                "<div>⟳&nbsp;&nbsp;Iniciando ROLLBACK...</div>"
            document.body.appendChild(errorLog)

            await wait(1100)

            /* 5. ROLLBACK en grande */
            const rollbackOverlay=document.createElement("div")
            rollbackOverlay.className="rollback-overlay"
            rollbackOverlay.textContent="⟳ ROLLBACK"
            document.body.appendChild(rollbackOverlay)

            await wait(1800)

            /* 6. Paquete regresa por el mismo camino */
            await movePacket(packet,nodeUS,"red")
            await wait(200)
            await movePacket(packet,nodeEU,"red")
            await wait(200)
            await movePacket(packet,api,"red")
            await wait(200)
            await movePacket(packet,sendBtn,"red")

            /* 7. Restaurar dinero */
            packet.classList.remove("packet-error")
            packet.classList.add("packet-rollback")
            if(typeof window.doRollback==="function") window.doRollback()

            await wait(700)

            /* 8. Limpiar overlays */
            rollbackOverlay.style.transition="opacity 0.8s ease"
            rollbackOverlay.style.opacity="0"
            errorLog.style.transition="opacity 0.8s ease"
            errorLog.style.opacity="0"
            setTimeout(()=>{rollbackOverlay.remove(); errorLog.remove()},800)

            /* 9. Paquete desaparece en el botón */
            packet.style.transition="opacity 0.4s ease"
            packet.style.opacity="0"
            setTimeout(()=>packet.remove(),400)

            /* 10. Limpiar nodo */
            setTimeout(()=>nodeLAT.classList.remove("arch-node-error"),1500)

            /* 11. Cucaracha se retira */
            await wait(1000)
            roach.style.transition="left 1.6s ease"
            roach.style.left="-300px"

            /* 12. Resetear */
            transferCount=0
            running=false
        }
    })

})

}())
