import { supabase } from './supabase-config.js'

// Funkcja do zapisywania wyniku
async function saveHighScore(name, score) {
    try {
        const { data, error } = await supabase
            .from('high_scores')
            .insert([
                { 
                    name: name, 
                    score: score,
                    created_at: new Date().toISOString()
                }
            ])
            .select()

        if (error) throw error
        console.log("Score saved successfully:", data)
        return data[0].id
    } catch (e) {
        console.error("Error saving score:", e)
        return null
    }
}

// Funkcja do pobierania wyników
async function getHighScores() {
    try {
        const { data, error } = await supabase
            .from('high_scores')
            .select('*')
            .order('score', { ascending: false })
            .limit(5)

        if (error) throw error
        return data
    } catch (e) {
        console.error("Error getting high scores:", e)
        return []
    }
}

export { saveHighScore, getHighScores }