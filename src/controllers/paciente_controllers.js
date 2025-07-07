import Paciente from "../models/Paciente.js"
import { sendMailToOwner } from "../config/nodemailer.js"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"
import mongoose from 'mongoose'


const registrarPaciente = async (req, res) => {
    try {
        console.log("📥 req.body:", req.body);
        console.log("📁 req.files:", req.files);

        const { emailPropietario } = req.body;

        if (Object.values(req.body).includes("")) {
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        }

        const verificarEmailBDD = await Paciente.findOne({ emailPropietario });
        if (verificarEmailBDD) {
            return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
        }

        const password = Math.random().toString(36).toUpperCase().slice(2, 5);

        const nuevoPaciente = new Paciente({
            ...req.body,
            passwordPropietario: await Paciente.prototype.encrypPassword(password),
            veterinario: req.veterinarioBDD._id
        });

        if (req.files?.imagen) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(
                req.files.imagen.tempFilePath,
                { folder: "Pacientes" }
            );
            nuevoPaciente.avatarMascota = secure_url;
            nuevoPaciente.avatarMascotaID = public_id;
            await fs.unlink(req.files.imagen.tempFilePath);
        }

        if (req.body?.avatarMascotaIA) {
            const base64Data = req.body.avatarMascotaIA.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");

            const { secure_url } = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "Pacientes", resource_type: "auto" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });

            nuevoPaciente.avatarMascotaIA = secure_url;
        }

        await nuevoPaciente.save();

        await sendMailToOwner(emailPropietario, "VET" + password);

        return res.status(201).json({ msg: "Registro exitoso de la mascota y correo enviado al propietario" });

    } catch (error) {
        console.error("❌ ERROR INTERNO:", error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};


const listarPacientes = async (req,res)=>{
    const pacientes = await Paciente.find({estadoMascota:true}).where('veterinario').equals(req.veterinarioBDD).select("-salida -createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    res.status(200).json(pacientes)
}

const detallePaciente = async (req,res) =>{
    //Obtener datos del frontend o cliente rest
    const {id} = req.params
    //Validaciones
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`});
    //Logica del negocio
    const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    //Responder
    res.status(200).json(paciente)
}

const eliminarPaciente = async (req,res) => {
    const {id} = req.params;

    // Validaciones
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"}); [1]
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({msg:`Lo sentimos, no existe el paciente ${id}`}); [1]

    // Lógica del negocio: Actualizar la fecha de salida de la mascota
    const {salidaMascota} = req.body; [1]
    await Paciente.findByIdAndUpdate(req.params.id, {salidaMascota: salidaMascota}); [1]

    // Responder
    res.status(200).json({msg:"Fecha de salida de la mascota registrada exitosamente"}); [1]
}

export{
    registrarPaciente,
    listarPacientes,
    detallePaciente
}