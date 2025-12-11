import { supabase, Recurrence, Transaction } from './supabase';

/**
 * Checks for active recurrences and generates transactions if due.
 * Should be called on app initialization or via a cron job.
 * @param userId The ID of the user to check recurrences for.
 * @returns Summary of operations.
 */
export async function checkAndGenerateRecurrences(userId: string) {
    console.log('[Recurrence] Checking for user:', userId);

    // 1. Fetch active recurrences
    const { data: recurrences, error } = await supabase
        .from('recurrences')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true);

    if (error) {
        console.error('[Recurrence] Error fetching recurrences:', error);
        return { success: false, error };
    }

    if (!recurrences || recurrences.length === 0) {
        return { success: true, count: 0, message: 'No active recurrences.' };
    }

    let generatedCount = 0;
    const errors: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const rule of recurrences as Recurrence[]) {
        try {
            // Determine the next due date
            // If never generated, check start_date or first due occurrence after start_date
            let nextDueDate: Date;

            if (rule.last_generated) {
                // If previously generated, calculate next one based on frequency
                const last = new Date(rule.last_generated); // Treat as string Date YYYY-MM-DD
                nextDueDate = calculateNextDate(last, rule.frequency, rule.due_day);
            } else {
                // First time generation logic
                // If start_date is in the past, acts as the first anchor.
                // But we must align with due_day if provided.

                // Simplified: Start date is the first potential occurrence.
                // Or if monthly, align start_date to the due_day?
                // Let's assume start_date is the "Contract Start". 
                // We find the first occurrence ON or AFTER start_date.

                const start = new Date(rule.start_date);
                nextDueDate = start;

                // Adjust for monthly specific day
                if (rule.frequency === 'monthly' && rule.due_day) {
                    if (start.getDate() > rule.due_day) {
                        // Move to next month
                        nextDueDate = new Date(start.getFullYear(), start.getMonth() + 1, rule.due_day);
                    } else {
                        // Same month
                        nextDueDate = new Date(start.getFullYear(), start.getMonth(), rule.due_day);
                    }
                }
            }

            // Loop to generate "Catch-up" transactions if multiple missed
            // Safety break to prevent infinite loops (e.g. max 12 iterations = 1 year)
            let catchUpLimit = 12;

            while (nextDueDate <= today && catchUpLimit > 0) {
                // Check if end_date reached
                if (rule.end_date && new Date(rule.end_date) < nextDueDate) {
                    // This rule has expired
                    // Optionally mark as inactive?
                    break;
                }

                console.log(`[Recurrence] Generating for rule: ${rule.name}, Date: ${nextDueDate.toISOString().split('T')[0]}`);

                // Generate Transaction
                const newTransaction: Partial<Transaction> = {
                    user_id: userId,
                    amount: rule.amount,
                    description: rule.name, // Or `${rule.name} - ${nextDueDate.toLocaleDateString()}`
                    type: rule.type,
                    category: rule.category,
                    date: nextDueDate.toISOString(), // ISO String
                    recurrence_id: rule.id,
                    status: 'pending', // Default status
                    // Copy other fields if needed
                };

                // Insert
                const { error: insertError } = await supabase
                    .from('transactions')
                    .insert(newTransaction);

                if (insertError) throw insertError;

                // Update Recurrence last_generated
                // Important: Update with the date we just generated for, NOT today's date
                // to maintain strict frequency intervals.
                const { error: updateError } = await supabase
                    .from('recurrences')
                    .update({ last_generated: nextDueDate.toISOString().split('T')[0] })
                    .eq('id', rule.id);

                if (updateError) throw updateError;

                // Prepare next date for next iteration
                nextDueDate = calculateNextDate(nextDueDate, rule.frequency, rule.due_day);
                generatedCount++;
                catchUpLimit--;
            }

            if (catchUpLimit === 0 && nextDueDate <= today) {
                console.warn(`[Recurrence] Catch-up limit reached for rule ${rule.name}`);
            }

        } catch (err) {
            console.error(`[Recurrence] Error processing rule ${rule.id}:`, err);
            errors.push({ id: rule.id, error: err });
        }
    }

    return {
        success: true,
        count: generatedCount,
        errors: errors.length > 0 ? errors : undefined
    };
}

function calculateNextDate(current: Date, frequency: string, dueDay?: number): Date {
    const next = new Date(current);
    next.setHours(0, 0, 0, 0); // Ensure time is clear

    switch (frequency) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'monthly':
            // Logic to preserve the dueDay (e.g. Jan 31 -> Feb 28 -> Mar 31)
            // Or simple add month?
            // Simple add month can drift: Jan 31 + 1 month -> Feb 28/29. Feb 28 + 1 month -> Mar 28.
            // If dueDay is fixed, we should construct date.
            if (dueDay !== undefined) {
                // Move to next month, force day
                // Note: 'current' was the last generated date.
                // We assume current is correct month/year.
                // Actually safer to just increment month.
                let nextMonth = next.getMonth() + 1;
                let nextYear = next.getFullYear();
                if (nextMonth > 11) {
                    nextMonth = 0;
                    nextYear++;
                }

                // Handle end of months (e.g. asking for day 31 in Feb)
                // If we want Strictly day 31, and Feb doesn't have it...
                // Option A: Skip to next month's 1st?
                // Option B: Clamp to last day of month? (Common financial behavior)
                const lastDayOfNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
                const targetDay = Math.min(dueDay, lastDayOfNextMonth);

                next.setFullYear(nextYear);
                next.setMonth(nextMonth);
                next.setDate(targetDay);
            } else {
                next.setMonth(next.getMonth() + 1);
            }
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
        default:
            next.setDate(next.getDate() + 1);
    }
    return next;
}
