import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { infoEmbed, successEmbed } from '../../utils/embeds.js';
import { withErrorHandling } from '../../utils/errorHandler.js';
import { verifyUser } from '../../services/verificationService.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Vérifie-toi et accède au serveur'),

    async execute(interaction, config, client) {
        const wrappedExecute = withErrorHandling(async () => {
            const guild = interaction.guild;

            const result = await verifyUser(client, guild.id, interaction.user.id, {
                source: 'command_self',
                moderatorId: null
            });

            if (!result.success) {
                if (result.alreadyVerified) {
                    return await InteractionHelper.safeReply(interaction, {
                        embeds: [infoEmbed('Already Verified', "Vous êtes déjà vérifié.")],
                        flags: MessageFlags.Ephemeral
                    });
                }

                return await replyUserError(interaction, { type: ErrorTypes.UNKNOWN, message: 'Une erreur est apparue pendant la vérification, Veuillez réessayer ou contacter un administrateur.' });
            }

            await InteractionHelper.safeReply(interaction, {
                embeds: [successEmbed(
                    "Verification Complete",
                    `Vous avez été vérifié et reçu le **${result.roleName}** rôle ! Bienvenue sur le serveur ! 🎉`
                )],
                flags: MessageFlags.Ephemeral
            });
        }, { command: 'verify' });

        return await wrappedExecute(interaction, config, client);
    }
};
