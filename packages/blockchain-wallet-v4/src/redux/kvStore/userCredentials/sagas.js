import { isEmpty, isNil } from 'ramda'
import { set } from 'ramda-lens'
import { call, put, select } from 'redux-saga/effects'

import { KVStoreEntry } from '../../../types'
import { callTask } from '../../../utils/functional'
import { getCreateExchangeUserOnSignupOrLogin } from '../../walletOptions/selectors'
import { derivationMap, USER_CREDENTIALS } from '../config'
import { getMetadataXpriv } from '../root/selectors'
import * as A from './actions'

export default ({ api, networks }) => {
  const createUserCredentials = function* (kv) {
    const createExchangeUserFlag = (yield select(getCreateExchangeUserOnSignupOrLogin)).getOrElse(
      false
    )
    const user_id = ''
    const lifetime_token = ''
    const exchange_user_id = ''
    const exchange_lifetime_token = ''
    // When feature flag to create unified accounts is off
    // We don't want to create a kv store entry for exchange credentials
    let newkv
    if (createExchangeUserFlag) {
      newkv = set(
        KVStoreEntry.value,
        { exchange_lifetime_token, exchange_user_id, lifetime_token, user_id },
        kv
      )
    } else {
      newkv = set(KVStoreEntry.value, { lifetime_token, user_id }, kv)
    }
    yield put(A.createMetadataUserCredentials(newkv))
  }

  const fetchMetadataUserCredentials = function* () {
    // this creates and fetches metadata

    try {
      const typeId = derivationMap[USER_CREDENTIALS]
      const mxpriv = yield select(getMetadataXpriv)
      const kv = KVStoreEntry.fromMetadataXpriv(mxpriv, typeId, networks.btc)
      yield put(A.fetchMetadataUserCredentialsLoading())

      const newkv = yield callTask(api.fetchKVStore(kv))
      if (isNil(newkv.value) || isEmpty(newkv.value)) {
        yield call(createUserCredentials, newkv)
      } else {
        yield put(A.fetchMetadataUserCredentialsSuccess(newkv))
      }
    } catch (e) {
      yield put(A.fetchMetadataUserCredentialsFailure(e.message))
    }
  }

  return {
    fetchMetadataUserCredentials
  }
}
