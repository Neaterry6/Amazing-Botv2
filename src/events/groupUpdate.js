import logger from '../utils/logger.js';
import config from '../config.js';
import { getGroup, updateGroup } from '../models/Group.js';
import { createPromoteImage, createDemoteImage, createGroupUpdateImage } from '../utils/canvasUtils.js';
import { isProtected } from '../utils/antihijack.js';

export default async function handleGroupUpdate(sock, update) {
    try {
        const groupId = update.id;
        const action = update.action;
        const participants = update.participants || [];
        const author = update.author;
        
        const group = await getGroup(groupId);
        if (!group) return;
        
        const groupMetadata = await sock.groupMetadata(groupId);
        const currentGroupName = groupMetadata.subject || 'Group';
        const currentGroupDesc = groupMetadata.desc || 'No description';
        
        if (action === 'promote' && participants.length > 0) {
            for (const participant of participants) {
                try {
                    const userName = participant.split('@')[0];
                    const authorName = author ? author.split('@')[0] : 'Admin';
                    
                    const promoteImage = await createPromoteImage(userName, currentGroupName, authorName);
                    
                    const promoteMessage = `╭──⦿【 👑 PROMOTION 】\n│\n│ 🎉 Congratulations @${userName}!\n│ ⬆️ You are now a Group Admin\n│ 👨‍💼 Promoted by: @${authorName}\n│ 💼 Use your power wisely!\n│\n╰────────────⦿`;
                    
                    await sock.sendMessage(groupId, {
                        image: promoteImage,
                        caption: promoteMessage,
                        mentions: [participant, author]
                    });
                    
                    logger.info(`Promote notification sent for ${userName} in ${currentGroupName}`);
                } catch (error) {
                    logger.error(`Error sending promote notification:`, error);
                }
            }
        }
        
        if (action === 'demote' && participants.length > 0) {
            // ANTI-HIJACK: if protection is on and someone mass-demotes many admins,
            // kick the person who did it. Bot must be admin to respond.
            try {
                if (isProtected(groupId) && participants.length >= 2) {
                    const isBotAdmin = groupMetadata.participants?.some(p => p.id === sock.user?.id && p.admin);
                    if (isBotAdmin && author && author !== sock.user?.id) {
                        // Mass demote = hijack attempt. Demote + kick the author.
                        const isAuthorAdmin = groupMetadata.participants?.some(p => p.id === author && p.admin);
                        if (isAuthorAdmin) {
                            await sock.groupParticipantsUpdate(groupId, [author], 'demote');
                        }
                        await sock.groupParticipantsUpdate(groupId, [author], 'remove');
                        await sock.sendMessage(groupId, {
                            text: `🛡️ *ANTI-HIJACK TRIGGERED!*\n\n🚨 @${author?.split('@')[0]} tried to hijack this group by demoting ${participants.length} admins at once.\n\n👋 They have been kicked.`,
                            mentions: [author]
                        });
                        logger.warn(`[Anti-hijack] Kicked ${author} from ${groupId} for mass demote of ${participants.length} admins`);
                        return;
                    }
                }
            } catch (e) {
                logger.error('[Anti-hijack] Error handling demote:', e);
            }

            for (const participant of participants) {
                try {
                    const userName = participant.split('@')[0];
                    const authorName = author ? author.split('@')[0] : 'Admin';
                    
                    const demoteImage = await createDemoteImage(userName, currentGroupName, authorName);
                    
                    const demoteMessage = `╭──⦿【 ⬇️ DEMOTION 】\n│\n│ 📉 @${userName} is no longer an admin\n│ 👮 Demoted by: @${authorName}\n│ 👤 Now a regular member\n│\n╰────────────⦿`;
                    
                    await sock.sendMessage(groupId, {
                        image: demoteImage,
                        caption: demoteMessage,
                        mentions: [participant, author]
                    });
                    
                    logger.info(`Demote notification sent for ${userName} in ${currentGroupName}`);
                } catch (error) {
                    logger.error(`Error sending demote notification:`, error);
                }
            }
        }
        
        if (update.subject) {
            try {
                const oldSubject = group.name || currentGroupName;
                const newSubject = update.subject;
                const authorName = author ? author.split('@')[0] : 'Admin';
                
                const updateImage = await createGroupUpdateImage('Group Name', oldSubject, newSubject, authorName);
                
                const updateMessage = `╭──⦿【 📝 GROUP NAME CHANGED 】\n│\n│ 🔄 Group name updated\n│ 📛 Old: ${oldSubject}\n│ 📛 New: ${newSubject}\n│ 👨‍💼 Changed by: @${authorName}\n│\n╰────────────⦿`;
                
                await sock.sendMessage(groupId, {
                    image: updateImage,
                    caption: updateMessage,
                    mentions: author ? [author] : []
                });
                
                await updateGroup(groupId, {
                    name: newSubject,
                    $push: {
                        'history.nameChanges': {
                            oldName: oldSubject,
                            newName: newSubject,
                            changedBy: author,
                            changedAt: new Date()
                        }
                    }
                });
                
                logger.info(`Group name change notification sent in ${newSubject}`);
            } catch (error) {
                logger.error(`Error sending group name change notification:`, error);
            }
        }
        
        if (update.desc) {
            try {
                const authorName = author ? author.split('@')[0] : 'Admin';
                const oldDesc = group.description || currentGroupDesc;
                const newDesc = update.desc || 'No description';
                
                const updateImage = await createGroupUpdateImage('Description', 
                    oldDesc.length > 50 ? oldDesc.substring(0, 47) + '...' : oldDesc,
                    newDesc.length > 50 ? newDesc.substring(0, 47) + '...' : newDesc,
                    authorName);
                
                const updateMessage = `╭──⦿【 📝 DESCRIPTION CHANGED 】\n│\n│ 📋 Group description updated\n│ 👨‍💼 Changed by: @${authorName}\n│\n│ 📄 New Description:\n│ ${newDesc}\n│\n╰────────────⦿`;
                
                await sock.sendMessage(groupId, {
                    image: updateImage,
                    caption: updateMessage,
                    mentions: author ? [author] : []
                });
                
                await updateGroup(groupId, {
                    description: newDesc,
                    $push: {
                        'history.descChanges': {
                            oldDesc: oldDesc,
                            newDesc: newDesc,
                            changedBy: author,
                            changedAt: new Date()
                        }
                    }
                });
                
                logger.info(`Group description change notification sent in ${currentGroupName}`);
            } catch (error) {
                logger.error(`Error sending group description change notification:`, error);
            }
        }
        
        if (update.announce !== undefined) {
            const authorName = author ? author.split('@')[0] : 'Admin';
            const announceStatus = update.announce ? 'enabled' : 'disabled';
            
            const announceMessage = `╭──⦿【 📢 GROUP SETTINGS 】\n│\n│ 🔒 Send messages setting changed\n│ 📊 Status: Only admins can send messages is now ${announceStatus}\n│ 👨‍💼 Changed by: @${authorName}\n│\n╰────────────⦿`;
            
            await sock.sendMessage(groupId, {
                text: announceMessage,
                mentions: author ? [author] : []
            });
        }
        
        if (update.restrict !== undefined) {
            const authorName = author ? author.split('@')[0] : 'Admin';
            const restrictStatus = update.restrict ? 'enabled' : 'disabled';
            
            const restrictMessage = `╭──⦿【 ⚙️ GROUP SETTINGS 】\n│\n│ 🔧 Edit group info setting changed\n│ 📊 Status: Only admins can edit info is now ${restrictStatus}\n│ 👨‍💼 Changed by: @${authorName}\n│\n╰────────────⦿`;
            
            await sock.sendMessage(groupId, {
                text: restrictMessage,
                mentions: author ? [author] : []
            });
        }
        
    } catch (error) {
        logger.error('Error in groupUpdate event:', error);
    }
}
