import { Request, Response } from 'express';
import { Ticket, User, Book, TicketMessage } from '../models';
import { aiService } from '../services/aiService';

export const testClassification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, description, bookTitle } = req.body;

    if (!subject || !description) {
      res.status(400).json({
        success: false,
        error: 'Subject and description are required for AI analysis.',
      });
      return;
    }

    const result = await aiService.classifyAndPrioritize(subject, description, bookTitle);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error executing AI classification.',
    });
  }
};

export const regenerateDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.ticketId as string;

    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        { model: User, as: 'author' },
        { model: Book, as: 'book' },
        { model: TicketMessage, as: 'messages' },
      ],
    });

    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found.' });
      return;
    }

    const draftResult = await aiService.generateDraftResponse({
      ticket,
      author: ticket.get('author'),
      book: ticket.get('book'),
      conversationHistory: ticket.get('messages') as any[],
    });

    ticket.ai_draft_response = draftResult.draft;
    await ticket.save();

    res.json({
      success: true,
      draft: draftResult.draft,
      source: draftResult.source,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error regenerating AI draft.',
    });
  }
};
