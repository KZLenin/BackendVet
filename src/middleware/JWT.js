import jwt from "jsonwebtoken"
import veterinario from "../models/veterinario.js"
import Paciente from "../models/paciente.js"

const crearTokenJWT = (id, rol) => {
    return jwt.sign({id,rol}, process.env.JWT_SECRET,{expiresIn:"1d"})
}

const verificarTokenJWT = async(req, res, next)=>{
    const {authorization} = req.headers
    if (!authorization) return res.status(401).json({msg:"Token no proporcionado"})

    try {
        const token = authorization.split(' ')[1]
        const {id,rol} = jwt.verify(token, process.env.JWT_SECRET)
        if (rol==="veterinario"){
            req.veterinarioBDD = await veterinario.findById(id).lean().select("-password")
            next()
        } else{
            req.pacienteBDD = await Paciente.findById(id).lean().select("-password")
            next()
        }   
    } catch (error) {
        return res.status(401).json({ msg: "Token inválido o expirado" })
    }
}

export{
    crearTokenJWT,
    verificarTokenJWT,
}