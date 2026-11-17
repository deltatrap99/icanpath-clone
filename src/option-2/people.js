/* Students stay at the center, with a clear next action for every companion. */
(() => {
  'use strict';
  function render(h, { icon, focusCode }) {
    const roles = [
      { key: 'student', icon: 'user', title: 'Dành cho học sinh', description: 'Em nhận ra điểm mạnh và những điều cần luyện thêm, để chọn cách học vừa sức và tự tin tiến bộ mỗi ngày.', action: 'Nhập mã để bắt đầu', onClick: focusCode },
      { key: 'family', icon: 'family', title: 'Đồng hành cùng phụ huynh', description: 'Phụ huynh hiểu rõ hơn kết quả bốn kỹ năng, từ đó cùng con đặt mục tiêu và ghi nhận từng bước tiến nhỏ.', action: 'Xem báo cáo năng lực', href: '#/r/demo-result' },
      { key: 'school', icon: 'school', title: 'Kết nối với nhà trường', description: 'Nhà trường theo dõi kết quả từng khối, từng lớp và nhận biết những nội dung cần hỗ trợ để đồng hành với học sinh.', action: 'Đăng nhập nhà trường', href: '#/school-portal' },
    ];
    const node = (name, className) => h('span', { class: 'people-orbit-node ' + className }, icon(name, 21));
    return h('section', { class: 'identity-section identity-people', id: 'identity-people', 'aria-labelledby': 'identity-people-title' },
      h('div', { class: 'people-heading' },
        h('span', { class: 'identity-kicker' }, 'CÙNG EM MỞ THÊM KHẢ NĂNG'),
        h('h2', { id: 'identity-people-title' }, 'Một hành trình, nhiều người đồng hành'),
        h('p', {}, 'Khi học sinh, gia đình và nhà trường cùng thấu hiểu, mỗi bước học tập sẽ có thêm sự tin tưởng và định hướng.')),
      h('div', { class: 'people-community' },
        h('div', { class: 'people-center' },
          h('div', { class: 'people-center-copy' },
            h('span', { class: 'people-center-label' }, icon('sun', 17), 'EM LÀ TRUNG TÂM'),
            h('h3', {}, 'Mỗi bước của em,', h('br'), ' đều có người đồng hành.')),
          h('div', { class: 'people-peri-scene', 'aria-hidden': 'true' },
            h('span', { class: 'people-orbit' }), h('span', { class: 'people-peri-ground' }),
            node('book', 'people-orbit-book'), node('family', 'people-orbit-family'), node('school', 'people-orbit-school'),
            window.ICanPeri.figure(h, 'wave', { class: 'people-peri', decorative: true })),
          h('p', { class: 'people-promise' }, 'Khi có người lắng nghe và động viên, em có thể tự tin thử thêm một điều mới mỗi ngày.')),
        h('div', { class: 'people-roles' }, roles.map(role => h('article', { class: 'people-role people-role-' + role.key, 'aria-labelledby': 'people-role-' + role.key },
          h('span', { class: 'people-role-icon' }, icon(role.icon, 25)),
          h('div', { class: 'people-role-content' }, h('h3', { id: 'people-role-' + role.key }, role.title), h('p', {}, role.description),
            h(role.href ? 'a' : 'button', { class: 'people-role-action', href: role.href, type: role.href ? null : 'button', onclick: role.onClick }, role.action, icon('arrow', 18))))))));
  }
  window.ICanPeople = { render };
})();
