// ========================================
// ENDPOINT BACKEND POUR LES COURS
// À ajouter dans votre fichier server.js ou app.js
// ========================================

// GET /api/courses - Récupérer les cours (avec filtres optionnels)
app.get('/api/courses', async (req, res) => {
  const { domainId, level } = req.query;
  let connection;
  
  try {
    connection = await getConnection();
    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];
    
    if (domainId) {
      query += ' AND domain_id = ?';
      params.push(domainId);
    }
    
    if (level) {
      // Mapper les niveaux pour correspondre à la DB
      const levelMap = {
        'easy': 'beginner',
        'debutant': 'beginner',
        'beginner': 'beginner',
        'intermediate': 'intermediate',
        'intermediaire': 'intermediate',
        'advanced': 'advanced',
        'avance': 'advanced'
      };
      
      const dbLevel = levelMap[level.toLowerCase()] || level.toLowerCase();
      query += ' AND level = ?';
      params.push(dbLevel);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query, params);
    
    // Formater les résultats pour correspondre au frontend
    const formattedCourses = rows.map(course => ({
      id: course.id,
      domain_id: course.domain_id,
      level: course.level,
      title: course.title,
      description: course.description || course.content.substring(0, 150) + '...',
      content: course.content,
      duration: course.duration || null,
      lessons: course.lessons || null,
      created_at: course.created_at
    }));
    
    res.status(200).json(formattedCourses);
  } catch (error) {
    console.error('Erreur récupération cours:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des cours.' });
  } finally {
    if (connection) await connection.end();
  }
});

// POST /api/courses - Créer un nouveau cours
app.post('/api/courses', async (req, res) => {
  const { domain_id, level, title, description, content, duration, lessons } = req.body;
  
  if (!domain_id || !level || !title || !content) {
    return res.status(400).json({ error: 'Champs requis manquants (domain_id, level, title, content).' });
  }
  
  // Valider le niveau
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  if (!validLevels.includes(level.toLowerCase())) {
    return res.status(400).json({ error: 'Niveau invalide. Utilisez: beginner, intermediate, ou advanced.' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO courses (domain_id, level, title, description, content, duration, lessons) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [domain_id, level.toLowerCase(), title, description || null, content, duration || null, lessons || null]
    );
    
    res.status(201).json({
      id: result.insertId,
      message: 'Cours créé avec succès.',
      domain_id,
      level,
      title
    });
  } catch (error) {
    console.error('Erreur création cours:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du cours.' });
  } finally {
    if (connection) await connection.end();
  }
});

// GET /api/courses/:id - Récupérer un cours spécifique
app.get('/api/courses/:id', async (req, res) => {
  const courseId = req.params.id;
  let connection;
  
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cours non trouvé.' });
    }
    
    const course = rows[0];
    res.status(200).json({
      id: course.id,
      domain_id: course.domain_id,
      level: course.level,
      title: course.title,
      description: course.description || course.content.substring(0, 150) + '...',
      content: course.content,
      duration: course.duration,
      lessons: course.lessons,
      created_at: course.created_at,
      updated_at: course.updated_at
    });
  } catch (error) {
    console.error('Erreur récupération cours:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du cours.' });
  } finally {
    if (connection) await connection.end();
  }
});

