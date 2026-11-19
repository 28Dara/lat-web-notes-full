import type { Request, Response } from 'express';
// NUEVO: isValidObjectId comprueba que el texto tenga forma de _id de MongoDB.
import { isValidObjectId } from 'mongoose';
import Note from '../models/note.js';

export const getNotes = async (req: Request, res: Response) => {
  const notes = await Note.find({ owner: req.user?.userId }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: notes, error: null });
};

export const createNote = async (req: Request, res: Response) => {
  // CORREGIDO: `?? {}` por si la petición llega sin body.
  const { title, body } = req.body ?? {};

  if (!title || !body) {
    res.status(400).json({
      success: false,
      data: null,
      error: { message: 'Los campos title y body son obligatorios' },
    });
    return;
  }

  // NUEVO: el servidor no asume que el front end mande texto.
  if (typeof title !== 'string' || typeof body !== 'string') {
    res.status(400).json({
      success: false,
      data: null,
      error: { message: 'Los campos title y body deben ser texto' },
    });
    return;
  }

  const note = await Note.create({ title, body, owner: req.user?.userId });
  res.status(201).json({ success: true, data: note, error: null });
};

export const deleteNote = async (req: Request, res: Response) => {
  // NUEVO: un id mal formado responde 404 en vez de reventar con un 500.
  // Va antes de findById, que es quien lanzaría el error.
  if (!isValidObjectId(req.params.id)) {
    res.status(404).json({
      success: false,
      data: null,
      error: { message: 'No se encontró la nota' },
    });
    return;
  }

  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404).json({
      success: false,
      data: null,
      error: { message: 'No se encontró la nota' },
    });
    return;
  }

  if (note.owner.toString() !== req.user?.userId) {
    res.status(403).json({
      success: false,
      data: null,
      error: { message: 'No puedes eliminar una nota que no es tuya' },
    });
    return;
  }

  await note.deleteOne();

  res
    .status(200)
    .json({ success: true, data: { message: 'Nota eliminada' }, error: null });
};
