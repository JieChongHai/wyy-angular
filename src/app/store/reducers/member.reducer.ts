import { createReducer, on, Action } from '@ngrx/store'
import { ShareType } from '@shared/interfaces/member'
import { SetLikeId, SetModalType, SetModalVisible, SetShareInfo, SetUserId } from '@store/actions/member.actions'

//#region interface
export enum ModalTypes {
  Register,
  LoginByPhone,
  Share,
  Like,
  Default,
}
export interface ShareInfo {
  id: string
  type: ShareType
  txt: string
}
export interface MemberState {
  modalVisible: boolean
  modalType: ModalTypes
  userId: string
  likeId: string
  shareInfo?: ShareInfo
}
//#endregion

export const initialState: MemberState = {
  modalVisible: false,
  modalType: ModalTypes.Default,
  userId: '',
  likeId: '',
}

const _reducer = createReducer(
  initialState,
  on(SetModalVisible, (state, { modalVisible }) => ({ ...state, modalVisible })),
  on(SetModalType, (state, { modalType }) => ({ ...state, modalType })),
  on(SetUserId, (state, { id }) => ({ ...state, userId: id })),
  on(SetLikeId, (state, { id }) => ({ ...state, likeId: id })),
  on(SetShareInfo, (state, { info }) => ({ ...state, shareInfo: info }))
)

export function memberReducer(state: MemberState | undefined, action: Action) {
  return _reducer(state, action)
}
