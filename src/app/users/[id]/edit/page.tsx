// src/app/users/[id]/edit/page.tsx의 formData 상태 및 폼 요소 수정
const [formData, setFormData] = useState({
  emp_no: '',
  name: '',
  organization: '',
  department: '',
  employee_type: '',
  account_type: 'SSO', // 계정 유형 필드 추가
  vendor_name: '',
  duty: '',
  work_scope: '',
  requester: '',
  status: '등록'
});

// 폼에 계정 유형 선택 필드 추가 (직원구분 필드 다음에 위치)
<div>
  <label className="block text-lg font-semibold text-black mb-2">계정 유형</label>
  <select
    name="account_type"
    value={formData.account_type}
    onChange={handleChange}
    className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
    required
  >
    <option value="SSO">SSO</option>
    <option value="WEBMAIL">WEBMAIL</option>
  </select>
</div>