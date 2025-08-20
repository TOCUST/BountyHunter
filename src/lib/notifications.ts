import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

export async function createNotification(data: {
  userId: string
  type: NotificationType
  title: string
  message: string
  bountyId?: string
  contractId?: string
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      bountyId: data.bountyId,
      contractId: data.contractId,
    }
  })
}

// Helper functions for common notification types
export async function notifyBountySubmitted(userId: string, bountyId: string, title: string) {
  return createNotification({
    userId,
    type: 'BOUNTY_SUBMITTED',
    title: '任务已提交审核',
    message: `您的任务"${title}"已提交审核，请等待管理员审核。`,
    bountyId,
  })
}

export async function notifyBountyApproved(userId: string, bountyId: string, title: string) {
  return createNotification({
    userId,
    type: 'BOUNTY_APPROVED',
    title: '任务审核通过',
    message: `您的任务"${title}"已审核通过，现在可以接受猎人申请了。`,
    bountyId,
  })
}

export async function notifyBountyRejected(userId: string, bountyId: string, title: string, reason: string) {
  return createNotification({
    userId,
    type: 'BOUNTY_REJECTED',
    title: '任务审核未通过',
    message: `您的任务"${title}"审核未通过：${reason}`,
    bountyId,
  })
}

export async function notifyProposalReceived(userId: string, bountyId: string, title: string) {
  return createNotification({
    userId,
    type: 'PROPOSAL_RECEIVED',
    title: '收到新的申请',
    message: `您的任务"${title}"收到了新的猎人申请，请及时查看。`,
    bountyId,
  })
}

export async function notifyProposalAccepted(userId: string, bountyId: string, title: string) {
  return createNotification({
    userId,
    type: 'PROPOSAL_ACCEPTED',
    title: '申请已被接受',
    message: `您对任务"${title}"的申请已被接受，请及时开始工作。`,
    bountyId,
  })
}

export async function notifyOfferReceived(userId: string, bountyId: string, title: string) {
  return createNotification({
    userId,
    type: 'OFFER_RECEIVED',
    title: '收到限时任务邀请',
    message: `您收到了任务"${title}"的限时邀请，请在15分钟内决定是否接受。`,
    bountyId,
  })
}

export async function notifyOfferExpired(userId: string, bountyId: string, title: string) {
  return createNotification({
    userId,
    type: 'OFFER_EXPIRED',
    title: '任务邀请已过期',
    message: `任务"${title}"的邀请已过期，您错过了这次机会。`,
    bountyId,
  })
}

export async function notifyContractFunded(userId: string, contractId: string) {
  return createNotification({
    userId,
    type: 'CONTRACT_FUNDED',
    title: '合同资金已托管',
    message: '合同资金已成功托管，您可以开始工作了。',
    contractId,
  })
}

export async function notifyWorkSubmitted(userId: string, contractId: string) {
  return createNotification({
    userId,
    type: 'WORK_SUBMITTED',
    title: '工作已提交',
    message: '猎人已提交工作成果，请及时验收。',
    contractId,
  })
}

export async function notifyWorkAccepted(userId: string, contractId: string) {
  return createNotification({
    userId,
    type: 'WORK_ACCEPTED',
    title: '工作已验收',
    message: '您的工作已被验收，资金已释放。',
    contractId,
  })
}

export async function notifyWorkRejected(userId: string, contractId: string, reason: string) {
  return createNotification({
    userId,
    type: 'WORK_REJECTED',
    title: '工作未通过验收',
    message: `您的工作未通过验收：${reason}`,
    contractId,
  })
}

export async function notifyFundsReleased(userId: string, contractId: string, amount: number) {
  return createNotification({
    userId,
    type: 'FUNDS_RELEASED',
    title: '资金已释放',
    message: `合同资金 ${amount} KRW 已释放到您的账户。`,
    contractId,
  })
}

export async function notifyFundsRefunded(userId: string, contractId: string, amount: number) {
  return createNotification({
    userId,
    type: 'FUNDS_REFUNDED',
    title: '资金已退款',
    message: `合同资金 ${amount} KRW 已退回到您的账户。`,
    contractId,
  })
}

export async function notifyPointsEarned(userId: string, points: number, reason: string) {
  return createNotification({
    userId,
    type: 'POINTS_EARNED',
    title: '积分到账',
    message: `您获得了 ${points} 积分：${reason}`,
  })
}

export async function notifyPointsWithdrawn(userId: string, points: number, krwAmount: number) {
  return createNotification({
    userId,
    type: 'POINTS_WITHDRAWN',
    title: '积分提现申请',
    message: `您的 ${points} 积分提现申请（${krwAmount} KRW）已提交，请等待审核。`,
  })
}
