const { Specialization } = require('../Models/Specialization');

const getLocalizedMessages = (lang) => {
  const messages = {
    en: {
      specializationNotFound: 'Specialization not found',
      internalServerError: 'Internal Server Error',
      specializationCreated: 'Specialization created successfully',
      allSpecializationsRetrieved: 'All specializations retrieved successfully',
      specializationRetrieved: 'Specialization retrieved successfully',
      specializationUpdated: 'Specialization updated successfully',
      specializationDeleted: 'Specialization deleted successfully',
    },
    ar: {
      specializationNotFound: 'التخصص غير موجود',
      internalServerError: 'خطأ داخلي في الخادم',
      specializationCreated: 'تم إنشاء التخصص بنجاح',
      allSpecializationsRetrieved: 'تم استرجاع كل التخصصات بنجاح',
      specializationRetrieved: 'تم استرجاع التخصص بنجاح',
      specializationUpdated: 'تم تحديث التخصص بنجاح',
      specializationDeleted: 'تم حذف التخصص بنجاح',
    },
  };

  return messages[lang] || messages.en;
};

const createSpecialization = async (req, res) => {
  try {
    const { name, priority } = req.body;
    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);

    let priorityObject;
    if (typeof priority === 'object') {
      priorityObject = priority; 
    } else if (typeof priority === 'string') {
      priorityObject = JSON.parse(priority); 
    }

    const newSpecialization = await Specialization.create({
      name,
      priority: JSON.stringify(priorityObject), 
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const formattedSpecialization = {
      id: newSpecialization.id,
      name: newSpecialization.name,
      priority: JSON.parse(newSpecialization.priority),
      createdAt: newSpecialization.createdAt,
      updatedAt: newSpecialization.updatedAt,
    };

    return res.status(201).json({
      data: formattedSpecialization,
      message: messages.specializationCreated,
    });
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);
    return res.status(500).json({ error: messages.internalServerError });
  }
};


const getAllSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.findAll();

    const formattedSpecializations = specializations.map(spec => ({
      id: spec.id,
      name: spec.name,
      priority: JSON.parse(spec.priority),
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt,
    }));

    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);

    return res.status(200).json({
      data: formattedSpecializations,
    });
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);
    return res.status(500).json({ error: messages.internalServerError });
  }
};

const getSpecializationById = async (req, res) => {
  const { id } = req.params;

  try {
    const specialization = await Specialization.findByPk(id);

    if (!specialization) {
      const lang = req.headers['lang'] || 'en';
      const messages = getLocalizedMessages(lang);
      return res.status(404).json({ error: messages.specializationNotFound });
    }

    // Convert priority string back to an object
    const formattedSpecialization = {
      id: specialization.id,
      name: specialization.name,
      priority: JSON.parse(specialization.priority),
      createdAt: specialization.createdAt,
      updatedAt: specialization.updatedAt,
    };

    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);

    return res.status(200).json({
      data: formattedSpecialization,
    });
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);
    return res.status(500).json({ error: messages.internalServerError });
  }
};

const updateSpecialization = async (req, res) => {
  const { id } = req.params;
  const { name, priority } = req.body;

  try {
    const specialization = await Specialization.findByPk(id);

    if (!specialization) {
      const lang = req.headers['lang'] || 'en';
      const messages = getLocalizedMessages(lang);
      return res.status(404).json({ error: messages.specializationNotFound });
    }

    let priorityObject;

    // Check if the priority is already an object or a JSON string
    if (typeof priority === 'object') {
      priorityObject = priority;  // Use the object directly
    } else if (typeof priority === 'string') {
      priorityObject = JSON.parse(priority);  // Parse the JSON string
    }

    // You can perform additional validations on priorityObject if necessary

    specialization.name = name || specialization.name;
    specialization.priority = JSON.stringify(priorityObject) || specialization.priority;
    specialization.updatedAt = new Date();

    await specialization.save();

    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);

    return res.status(200).json({
      data: {
        id: specialization.id,
        name: specialization.name,
        priority: JSON.parse(specialization.priority),
        createdAt: specialization.createdAt,
        updatedAt: specialization.updatedAt,
      },
      message: messages.specializationUpdated,
    });
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);
    return res.status(500).json({ error: messages.internalServerError });
  }
};

const deleteSpecialization = async (req, res) => {
  const { id } = req.params;

  try {
    const specialization = await Specialization.findByPk(id);

    if (!specialization) {
      const lang = req.headers['lang'] || 'en';
      const messages = getLocalizedMessages(lang);
      return res.status(404).json({ error: messages.specializationNotFound });
    }

    await specialization.destroy();

    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);

    return res.status(204).json({ message: messages.specializationDeleted });
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    const messages = getLocalizedMessages(lang);
    return res.status(500).json({ error: messages.internalServerError });
  }
};

module.exports = {
  createSpecialization,
  getAllSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
};
