#include <Windows.h>
#include "resource.h"

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
BOOL    CALLBACK SettingsDlgProc(HWND, UINT, WPARAM, LPARAM);

int iCurrentColor = IDD_CYAN,
iCurrentN = 5;

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance,
	PSTR szCmdLine, int iCmdShow)
{
	static char  szAppName[] = "Settings";
	MSG          msg;
	HWND          hwnd;
	WNDCLASSEX   wndclass;

	wndclass.cbSize = sizeof(wndclass);
	wndclass.style = CS_HREDRAW | CS_VREDRAW;
	wndclass.lpfnWndProc = WndProc;
	wndclass.cbClsExtra = 0;
	wndclass.cbWndExtra = 0;
	wndclass.hInstance = hInstance;
	wndclass.hIcon = LoadIcon(hInstance, szAppName);
	wndclass.hCursor = LoadCursor(NULL, IDC_ARROW);
	wndclass.hbrBackground = (HBRUSH)GetStockObject(WHITE_BRUSH);
	wndclass.lpszMenuName = szAppName;
	wndclass.lpszClassName = szAppName;
	wndclass.hIconSm = LoadIcon(hInstance, szAppName);

	RegisterClassEx(&wndclass);
	hwnd = CreateWindow(szAppName, "Coursework Program",
		WS_OVERLAPPEDWINDOW,
		CW_USEDEFAULT, CW_USEDEFAULT,
		CW_USEDEFAULT, CW_USEDEFAULT,
		NULL, NULL, hInstance, NULL);

	ShowWindow(hwnd, iCmdShow);
	UpdateWindow(hwnd);

	while (GetMessage(&msg, NULL, 0, 0))
	{
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}
	return msg.wParam;
}

void PaintWindow(HWND hwnd, int iColor, int iN)
{
	static COLORREF crColor[8] = { RGB(0,     0, 0), RGB(0,   0, 255),
		RGB(0,   255, 0), RGB(0, 255,  255),
		RGB(255,   0, 0), RGB(255,   0, 255),
		RGB(255, 255, 0), RGB(255, 255, 255) };
	HBRUSH			hBrush;
	HDC				hdc;
	RECT			rect;
	long			width;

	hdc = GetDC(hwnd);
	GetClientRect(hwnd, &rect);
	hBrush = CreateSolidBrush(crColor[iColor - IDD_BLACK]);
	hBrush = (HBRUSH)SelectObject(hdc, hBrush);

	width = rect.right / iN - rect.left;
	long mod = rect.right % iN;
	width = mod > 0 ? width + 1 : width;
	rect.right = width;

	for (int i = 1; i <= iN; i++)
	{
		char buffer[5];
		_itoa_s(i, buffer, 5, 10);

		Rectangle(hdc, rect.left, rect.top, rect.right, rect.bottom);

		SetBkMode(hdc, TRANSPARENT);
		DrawText(hdc, buffer, -1, &rect,
			DT_SINGLELINE | DT_CENTER | DT_VCENTER);

		if (mod == 0)
			width--;

		rect.left += width;
		rect.right = rect.left + width;

		mod--;
	}

	DeleteObject(SelectObject(hdc, hBrush));
	ReleaseDC(hwnd, hdc);
}

void PaintTheBlock(HWND hCtrl, int iColor, int iN)
{
	InvalidateRect(hCtrl, NULL, TRUE);
	UpdateWindow(hCtrl);
	PaintWindow(hCtrl, iColor, iN);
}

LRESULT CALLBACK  WndProc(HWND hwnd, UINT iMsg, WPARAM wParam, LPARAM lParam)
{
	static HINSTANCE hInstance;
	PAINTSTRUCT      ps;

	switch (iMsg)
	{

	case WM_CREATE:
		hInstance = ((LPCREATESTRUCT)lParam)->hInstance;
		return 0;

	case WM_COMMAND:
		switch (LOWORD(wParam))
		{
		case IDM_SETTINGS:
			if (DialogBox(hInstance, "SettingsBox", hwnd,
				SettingsDlgProc))
				InvalidateRect(hwnd, NULL, TRUE);
			return 0;

		case IDM_EXIT:
			exit(EXIT_SUCCESS);
			return 0;
		}

		break;

	case WM_PAINT:
		BeginPaint(hwnd, &ps);
		EndPaint(hwnd, &ps);

		PaintWindow(hwnd, iCurrentColor, iCurrentN);
		return 0;

	case WM_DESTROY:
		PostQuitMessage(0);
		return 0;
	}
	return DefWindowProc(hwnd, iMsg, wParam, lParam);
}

BOOL CALLBACK SettingsDlgProc(HWND hDlg, UINT iMsg, WPARAM wParam, LPARAM lParam)
{
	static HWND hCtrlBlock;
	static int iColor, iN;
	char buf[5];

	switch (iMsg)
	{
	case WM_INITDIALOG:
		iColor = iCurrentColor;
		iN = iCurrentN;

		CheckRadioButton(hDlg, IDD_BLACK, IDD_WHITE, iColor);

		_itoa_s(iN, buf, 5, 10);
		SetDlgItemText(hDlg, IDD_N, buf);
		SetFocus(GetDlgItem(hDlg, IDD_N));
		hCtrlBlock = GetDlgItem(hDlg, IDD_PAINT);
		return FALSE;

	case WM_COMMAND:
		switch (LOWORD(wParam))
		{
		case IDOK:
			iCurrentColor = iColor;
			iCurrentN = iN;
			EndDialog(hDlg, TRUE);
			return TRUE;

		case IDCANCEL:
			EndDialog(hDlg, FALSE);
			return TRUE;

		case IDD_BLACK:
		case IDD_RED:
		case IDD_GREEN:
		case IDD_YELLOW:
		case IDD_BLUE:
		case IDD_MAGENTA:
		case IDD_CYAN:
		case IDD_WHITE:
			iColor = LOWORD(wParam);
			CheckRadioButton(hDlg, IDD_BLACK, IDD_WHITE,
				(wParam));
			PaintTheBlock(hCtrlBlock, iColor, iN);
			return TRUE;

		case IDD_N:
			char buf[5];
			GetDlgItemText(hDlg, IDD_N, buf, 5);
			int value = (int)strtol(buf, NULL, 10);
			iN = value != 0 ? value : 1;
			PaintTheBlock(hCtrlBlock, iColor, iN);
			return TRUE;
		}
		break;

	case WM_PAINT:
		PaintTheBlock(hCtrlBlock, iColor, iN);
		break;
	}
	return FALSE;
}