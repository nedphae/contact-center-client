import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import _ from 'lodash';

import { ConverMap, Conver } from 'app/domain/Conver';
import { MessagesMap } from 'app/domain/Message';

const initConver = {} as ConverMap;

const converSlice = createSlice({
  name: 'conversation',
  initialState: initConver,
  reducers: {
    // 设置新会话
    newConver: (converMap, action: PayloadAction<Conver>) => {
      converMap[action.payload.conversation.userId] = action.payload;
    },
    stickyCustomer: (converMap, action: PayloadAction<number>) => {
      // 设置置顶
      const conver = converMap[action.payload];
      conver.sticky = !conver.sticky;
    },
    newMessage: (converMap, action: PayloadAction<MessagesMap>) => {
      // 设置新消息
      of(action.payload)
        .pipe(
          mergeMap((m) => {
            const { from } = m;
            return of(converMap[from]).pipe(
              map((c) => {
                _.merge(c.massageList, { [m.uuid]: m });
              })
            );
          })
        )
        .subscribe();
    },
  },
});

export default converSlice;

export const { reducer } = converSlice;
