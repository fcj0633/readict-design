import { test } from 'node:test'
import assert from 'node:assert/strict'
import { books, getEntry, normalize } from '@/data/mock'
import { getContext, mergeFavorite, mockService } from './services'

test('不同词形按 lemma 归并，不同语境追加，相同语境去重', () => {
  const entry = getEntry('runs')!
  const first = getContext(books[0], 2, 'He runs every morning.', 0, 3, 'runs')
  const second = getContext(books[0], 2, 'She runs a business.', 30, 34, 'runs')
  const list = mergeFavorite([], entry, entry.senses[0], first)
  const added = mergeFavorite(list, entry, entry.senses[1], second)
  const repeated = mergeFavorite(added, entry, entry.senses[1], second)
  assert.equal(repeated.length, 1)
  assert.equal(repeated[0].contexts.length, 2)
  assert.equal(repeated[0].sense.meaning, entry.senses[0].meaning)
  assert.equal(normalize('running'), normalize('runs'))
})

test('原文提取保留当前句子、词语范围和稳定定位', () => {
  const paragraph = 'He runs every morning. She runs a business.'
  const offset = 100 + paragraph.lastIndexOf('runs')
  const context = getContext(books[0], 2, paragraph, 100, offset, 'runs')
  assert.equal(context.sentence, 'She runs a business.')
  assert.equal(context.sentence.slice(context.start, context.end), 'runs')
  assert.equal(context.offset, offset)
})

test('默认三条释义之外仍保留更多释义', () => {
  assert.equal(getEntry('acknowledged')!.senses.length, 5)
  assert.equal(getEntry('mystery'), null)
})

test('过期词典请求支持取消，不返回迟到结果', async () => {
  const controller = new AbortController()
  const promise = mockService.lookup('running', controller.signal)
  controller.abort()
  await assert.rejects(promise, { name: 'AbortError' })
})

test('导入验证拒绝错误格式、空文件和过大文件', async () => {
  await assert.rejects(mockService.importBook(new File(['x'], 'sample.txt'), books[0]), /epub/)
  await assert.rejects(mockService.importBook(new File([], 'empty.epub'), books[0]), /为空/)
  const oversized = { name: 'large.epub', size: 51 * 1024 * 1024 } as File
  await assert.rejects(mockService.importBook(oversized, books[0]), /50 MB/)
})
