/* Authored, synthetic evidence for the illustrative school cohort, never real student work. */
(() => {
  'use strict';
  const tasks = [
    {
      id: 'L-detail', skill: 'L', kind: 'choice', criterion: 'Nghe thông tin chi tiết', error: 'Bỏ lỡ thông tin được đính chính',
      context: 'Mum: Is basketball at half past three? Sam: It was, but the coach moved it to quarter past four.', prompt: 'When does basketball practice start?',
      options: { A: 'At 3:30.', B: 'At 4:15.', C: 'At 4:30.' }, correct: 'B', misconception: 'A',
      explanation: 'Người nói đã thay đổi giờ tập từ 3:30 sang 4:15. Học sinh cần nghe cả phần đính chính, thay vì chọn ngay thời gian xuất hiện đầu tiên.',
      support: 'Thầy cô cho học sinh ghi lại thông tin ban đầu và thông tin được sửa, sau đó giải thích vì sao cần đổi đáp án.',
      practice: ['Học sinh gạch chân but, actually hoặc instead trong lời thoại để nhận ra tín hiệu thay đổi.', 'Các cặp học sinh nghe hai lượt, ghi hai mốc thông tin và thống nhất đáp án cuối cùng.', 'Thầy cô dùng một hội thoại mới có thông tin được sửa để kiểm tra lại cách chọn đáp án.'],
    },
    {
      id: 'L-main', skill: 'L', kind: 'choice', criterion: 'Nắm ý chính khi nghe', error: 'Chọn chi tiết thay cho ý chính',
      context: 'Our class planted flowers, collected litter and made signs to keep the playground clean. Everyone helped to make our school greener.', prompt: 'What is the speaker mainly talking about?',
      options: { A: 'Making signs for the playground.', B: 'Activities to make the school greener.', C: 'Buying flowers for a classroom.' }, correct: 'B', misconception: 'A',
      explanation: 'Làm biển nhắc nhở chỉ là một hoạt động trong đoạn nghe. Ý chính cần bao quát cả việc trồng hoa, nhặt rác và giữ sân trường sạch đẹp.',
      support: 'Thầy cô hướng dẫn học sinh tóm tắt đoạn nghe bằng một câu có thể bao quát tất cả các chi tiết.',
      practice: ['Học sinh ghi lại hai hoặc ba từ khóa sau lượt nghe đầu tiên.', 'Các nhóm chọn một câu tóm tắt bao quát các hoạt động, rồi đối chiếu với các chi tiết trong đoạn.', 'Thầy cô cho một đoạn nghe mới và yêu cầu học sinh giải thích vì sao đáp án bao quát hơn các lựa chọn còn lại.'],
    },
    {
      id: 'L-intent', skill: 'L', kind: 'choice', criterion: 'Hiểu ý định người nói', error: 'Hiểu lời đề nghị theo nghĩa trực tiếp',
      context: 'Mai: This box is really heavy. Could you give me a hand? Ben: Of course. Let’s carry it together.', prompt: 'What does Mai want Ben to do?',
      options: { A: 'Wave to her.', B: 'Help her carry the box.', C: 'Buy a lighter box.' }, correct: 'B', misconception: 'A',
      explanation: 'Give me a hand là một cách nhờ giúp đỡ. Ngữ cảnh chiếc hộp nặng giúp học sinh hiểu Mai đang muốn cùng Ben mang hộp.',
      support: 'Thầy cô cho học sinh đặt cụm từ vào ngữ cảnh, rồi nói lại ý định của người nói bằng cách diễn đạt quen thuộc.',
      practice: ['Học sinh đọc tình huống trước khi nghe để dự đoán điều người nói cần.', 'Các cặp học sinh đóng vai nhờ giúp đỡ và trả lời bằng hành động phù hợp.', 'Thầy cô đổi đồ vật hoặc tình huống để kiểm tra học sinh có hiểu ý định thay vì chỉ nhớ cụm từ hay không.'],
    },
    {
      id: 'R-detail', skill: 'R', kind: 'choice', criterion: 'Đọc đúng điều kiện và chi tiết', error: 'Bỏ sót điều kiện loại trừ trong thông báo',
      context: 'The library is open every weekday except Wednesday. Please return borrowed books before 4 p.m.', prompt: 'On which weekday is the library closed?',
      options: { A: 'Monday.', B: 'Wednesday.', C: 'Friday.' }, correct: 'B', misconception: 'A',
      explanation: 'Except Wednesday có nghĩa là ngoại trừ thứ Tư. Học sinh cần kết hợp thông tin mở cửa với điều kiện loại trừ để tìm ngày đóng cửa.',
      support: 'Thầy cô giúp học sinh đánh dấu các từ except, not và unless trước khi xác định thông tin cần tìm.',
      practice: ['Học sinh khoanh từ làm thay đổi ý nghĩa của câu hỏi hoặc thông báo.', 'Các cặp học sinh diễn đạt lại thông báo bằng một câu khẳng định và một câu phủ định.', 'Thầy cô đưa thông báo mới có điều kiện loại trừ để học sinh tự giải thích lựa chọn.'],
    },
    {
      id: 'R-infer', skill: 'R', kind: 'choice', criterion: 'Suy luận từ bằng chứng', error: 'Suy luận vượt quá thông tin trong bài',
      context: 'Linh put on her helmet and checked her bicycle lights before leaving for school.', prompt: 'What can we reasonably infer about Linh?',
      options: { A: 'She is training for a cycling race.', B: 'She cares about travelling safely.', C: 'She has bought a new bicycle.' }, correct: 'B', misconception: 'A',
      explanation: 'Mũ bảo hiểm và đèn xe hỗ trợ suy luận về sự an toàn. Đoạn văn không cho biết Linh đang tập đua xe hoặc vừa mua xe mới.',
      support: 'Thầy cô yêu cầu học sinh chỉ ra từ hoặc câu làm bằng chứng cho mỗi suy luận trước khi chọn đáp án.',
      practice: ['Học sinh tìm hai chi tiết được nêu rõ trong đoạn văn.', 'Các nhóm nối từng suy luận với bằng chứng và gạch bỏ suy luận không có căn cứ.', 'Thầy cô dùng một đoạn ngắn mới để học sinh trình bày cả đáp án lẫn bằng chứng hỗ trợ.'],
    },
    {
      id: 'R-context', skill: 'R', kind: 'choice', criterion: 'Hiểu từ trong ngữ cảnh', error: 'Áp dụng nghĩa quen thuộc chưa đúng ngữ cảnh',
      context: 'After the long walk, we stopped at a spring and filled our bottles with fresh water.', prompt: 'What does “spring” mean in this sentence?',
      options: { A: 'The season after winter.', B: 'A place where water comes out of the ground.', C: 'A metal coil.' }, correct: 'B', misconception: 'A',
      explanation: 'Các chi tiết filled our bottles và fresh water cho biết spring ở đây là nguồn nước, không phải mùa xuân.',
      support: 'Thầy cô cho học sinh thử thay từng nghĩa vào câu, rồi kiểm tra nghĩa nào phù hợp với các từ xung quanh.',
      practice: ['Học sinh gạch chân các từ làm gợi ý cho nghĩa của từ cần đoán.', 'Các cặp học sinh thử hai nghĩa khác nhau và giải thích nghĩa nào phù hợp.', 'Thầy cô đổi ngữ cảnh của cùng một từ để học sinh nhận ra nghĩa có thể thay đổi.'],
    },
    {
      id: 'S-develop', skill: 'S', kind: 'rubric', criterion: 'Phát triển câu trả lời', error: 'Trả lời ngắn và chưa giải thích lý do',
      prompt: 'What do you enjoy doing after school, and why?', error_example: 'I like football.', better_example: 'I enjoy playing football after school because it helps me relax and spend time with my friends.',
      explanation: 'Câu trả lời đã nêu hoạt động yêu thích nhưng chưa trả lời phần lý do. Tiêu chí mẫu ghi nhận khả năng mở rộng ý, không yêu cầu học sinh học thuộc câu dài.',
      support: 'Thầy cô dùng câu hỏi tiếp nối như Why? hoặc Can you give an example? để giúp học sinh bổ sung một ý vừa sức.',
      practice: ['Học sinh chọn một hoạt động gần gũi và nghĩ về lý do mình yêu thích hoạt động đó.', 'Các cặp học sinh luyện theo ba bước, nêu ý chính, giải thích lý do và thêm một ví dụ.', 'Thầy cô hỏi một chủ đề tương tự để quan sát học sinh có tự phát triển câu trả lời hay không.'],
    },
    {
      id: 'S-tense', skill: 'S', kind: 'rubric', criterion: 'Dùng thì phù hợp khi kể chuyện', error: 'Dùng hiện tại khi kể việc đã xảy ra',
      prompt: 'Tell us about something you did last weekend.', error_example: 'Last Sunday, I go to the park and play football.', better_example: 'Last Sunday, I went to the park and played football.',
      explanation: 'Last Sunday xác định thời điểm đã qua. Học sinh cần dùng dạng quá khứ của động từ để câu chuyện thống nhất về thời gian.',
      support: 'Thầy cô cho học sinh kể một trải nghiệm thật với hai hoặc ba động từ đã chuẩn bị, rồi khuyến khích tự sửa sau khi nghe lại.',
      practice: ['Học sinh tìm mốc thời gian và chọn các động từ cần dùng trong câu chuyện.', 'Các cặp học sinh kể chuyện ngắn, người nghe ghi lại một động từ đã dùng đúng và một chỗ cần xem lại.', 'Thầy cô đổi câu hỏi về một ngày đã qua để kiểm tra khả năng vận dụng dạng quá khứ.'],
    },
    {
      id: 'S-ending', skill: 'S', kind: 'rubric', criterion: 'Phát âm rõ âm cuối', error: 'Âm cuối chưa rõ trong từ quen thuộc',
      prompt: 'Read this sentence aloud: I have two cats.', error_example: 'Ghi chú quan sát mẫu: âm /s/ cuối từ cats chưa nghe rõ.', better_example: 'cats /kæts/, giữ âm /s/ ở cuối khi nói “two cats”.',
      explanation: 'Tiêu chí mẫu chỉ ghi nhận độ rõ của âm cuối trong câu được giao. Một lần đọc chưa rõ không đủ để kết luận về toàn bộ khả năng phát âm của học sinh.',
      support: 'Thầy cô làm mẫu âm cuối, cho học sinh luyện từ đến cụm từ và nghe lại bản ghi để tự nhận ra sự khác biệt.',
      practice: ['Học sinh nghe và phân biệt cat với cats, đồng thời chú ý âm xuất hiện ở cuối từ.', 'Các cặp học sinh luyện chậm từ cats, cụm two cats và câu hoàn chỉnh, rồi tăng dần tốc độ.', 'Thầy cô dùng một câu mới có âm /s/ cuối từ để quan sát độ rõ khi học sinh nói tự nhiên.'],
    },
    {
      id: 'W-agreement', skill: 'W', kind: 'rubric', criterion: 'Hòa hợp chủ ngữ và động từ', error: 'Chưa thêm đuôi động từ với he hoặc she',
      prompt: 'Write about a friend’s daily routine.', error_example: 'She go to school by bus every day.', better_example: 'She goes to school by bus every day.',
      explanation: 'Với chủ ngữ she trong câu khẳng định hiện tại đơn, go cần chuyển thành goes. Tiêu chí này xem cách dùng động từ trong ngữ cảnh cụ thể.',
      support: 'Thầy cô giúp học sinh nối chủ ngữ với động từ và dùng một lượt đọc lại chỉ để kiểm tra sự hòa hợp.',
      practice: ['Học sinh đánh dấu chủ ngữ và động từ trong câu mẫu.', 'Các cặp học sinh chuyển ba câu từ I sang he hoặc she, rồi giải thích phần động từ cần đổi.', 'Thầy cô giao một đoạn viết mới và yêu cầu học sinh tự đánh dấu những động từ đã kiểm tra.'],
    },
    {
      id: 'W-connect', skill: 'W', kind: 'rubric', criterion: 'Liên kết ý trong đoạn viết', error: 'Liệt kê ý và chưa làm rõ mối liên hệ',
      prompt: 'Write a short paragraph about an activity you enjoy.', error_example: 'I like reading. I read books. Books are interesting.', better_example: 'I enjoy reading because books help me discover new places. I usually read before going to bed.',
      explanation: 'Các câu đã cùng chủ đề nhưng ý còn lặp và mối liên hệ chưa rõ. Học sinh có thể bổ sung lý do hoặc chi tiết, rồi chọn từ nối phù hợp.',
      support: 'Thầy cô cho học sinh lập sơ đồ ý chính, lý do và ví dụ trước khi ghép thành một đoạn ngắn.',
      practice: ['Học sinh xác định câu nêu ý chính và một chi tiết muốn bổ sung.', 'Các nhóm ghép câu bằng because, and hoặc so khi quan hệ ý nghĩa phù hợp.', 'Thầy cô cho học sinh viết lại một đoạn mới và chỉ ra cách các câu hỗ trợ cùng một ý chính.'],
    },
    {
      id: 'W-punctuation', skill: 'W', kind: 'rubric', criterion: 'Viết hoa và ngắt câu', error: 'Bỏ qua viết hoa hoặc dấu kết câu',
      prompt: 'Write two sentences about your school.', error_example: 'my school is near my house i walk there every day', better_example: 'My school is near my house. I walk there every day.',
      explanation: 'Đoạn mẫu chứa hai ý hoàn chỉnh nhưng chưa có dấu kết câu và chữ hoa đầu câu. Việc ngắt câu giúp người đọc theo dõi ý rõ hơn.',
      support: 'Thầy cô hướng dẫn học sinh đọc thành tiếng, tìm điểm kết thúc từng ý và kiểm tra lại chữ hoa cùng dấu câu.',
      practice: ['Học sinh xác định mỗi ý hoàn chỉnh trong đoạn chưa có dấu câu.', 'Các cặp học sinh thêm dấu kết câu và chữ hoa, rồi đọc lại để đối chiếu.', 'Thầy cô giao hai câu mới và cho học sinh tự dùng bảng kiểm chữ hoa, ý hoàn chỉnh và dấu kết câu.'],
    },
  ].map(task => ({ ...task, correct: task.kind === 'choice' ? task.correct : 'met', misconception: task.kind === 'choice' ? task.misconception : 'needs_support' }));
  function responsesFor(student) {
    const [, classroom, pupil] = student.id.split('-').map(Number);
    return tasks.map((task, index) => {
      const skillIndex = Math.floor(index / 3);
      const missingSkill = (pupil + classroom * 3 + skillIndex * 7) % 23 === 0;
      const skipped = missingSkill || (pupil * 5 + classroom + index * 3) % 41 === 0;
      const sample = (pupil * 37 + classroom * 19 + index * 13) % 100;
      const supportRate = [62, 45, 36, 54, 58, 43, 64, 57, 47, 61, 56, 42][index];
      const value = skipped ? null : sample < supportRate ? task.misconception : task.kind === 'choice' && sample >= 93 ? 'C' : task.correct;
      return { student_id: student.id, task_id: task.id, value };
    });
  }
  window.ICanSchoolEvidence = { tasks, responsesFor };
})();
